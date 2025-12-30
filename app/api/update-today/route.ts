import { NextResponse } from "next/server";
import { google } from "googleapis";

function colToLetter(col: number) {
  let letter = "";
  let temp = col + 1;
  while (temp > 0) {
    const rem = (temp - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const entries: Array<any> = body.entries || [];
    const date = body.date || "";

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return NextResponse.json({ error: "Missing GOOGLE_SERVICE_ACCOUNT_KEY env var" }, { status: 500 });
    }
    if (!process.env.SHEET_ID) {
      return NextResponse.json({ error: "Missing SHEET_ID env var" }, { status: 500 });
    }

    const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY as string);

    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.SHEET_ID as string;
    const sheetName = process.env.SHEET_NAME || "Sheet1";

    // Read sheet data
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const values = readRes.data.values || [];
    if (values.length === 0) {
      return NextResponse.json({ error: "Sheet is empty" }, { status: 400 });
    }

    const header = values[0].map((h: any) => String(h || "").trim());

    function findHeaderIndex(possibleNames: string[]) {
      for (const name of possibleNames) {
        const idx = header.findIndex((h: string) => new RegExp(name, "i").test(h));
        if (idx >= 0) return idx;
      }
      return -1;
    }

    const dateCol = findHeaderIndex(["Date", "date", "start date"]);
    const vehicleCol = findHeaderIndex(["Vehicle No", "vehicle", "vehicle no", "registration"]);
    const driverNameCol = findHeaderIndex(["Driver Name", "driver name", "driver", "name"]);
    const phoneCol = findHeaderIndex(["Phone", "phone", "mobile", "contact"]);
    const clientCol = findHeaderIndex(["Client", "client", "company", "customer"]);

    if (dateCol === -1) {
      return NextResponse.json({ error: "Could not find Date column" }, { status: 400 });
    }
    if (vehicleCol === -1) {
      return NextResponse.json({ error: "Could not find Vehicle column" }, { status: 400 });
    }

    // Build map of vehicle -> row index for today's date only
    const vehicleMapForToday = new Map<string, number>();
    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      const rowDate = String((row[dateCol] || "")).trim();
      
      // Only match rows with today's date
      if (rowDate === date) {
        const cell = String((row[vehicleCol] || "")).replace(/\s+/g, "").toUpperCase();
        if (cell) vehicleMapForToday.set(cell, r + 1); // sheet rows are 1-based
      }
    }

    const updates: Array<{ range: string; values: any[][] }> = [];

    for (const entry of entries) {
      const keyVehicle = String(entry.vehicle || "").replace(/\s+/g, "").toUpperCase();
      if (!keyVehicle) continue;

      const rowNumber = vehicleMapForToday.get(keyVehicle);
      if (!rowNumber) {
        // Vehicle not found for today's date; skip
        continue;
      }

      // Update driver name
      if (driverNameCol !== -1 && entry.name) {
        const nameRange = `${sheetName}!${colToLetter(driverNameCol)}${rowNumber}`;
        updates.push({ range: nameRange, values: [[entry.name]] });
      }

      // Update phone
      if (phoneCol !== -1 && entry.mobile) {
        const phoneRange = `${sheetName}!${colToLetter(phoneCol)}${rowNumber}`;
        updates.push({ range: phoneRange, values: [[entry.mobile]] });
      }

      // Update client
      if (clientCol !== -1 && entry.client) {
        const clientRange = `${sheetName}!${colToLetter(clientCol)}${rowNumber}`;
        updates.push({ range: clientRange, values: [[entry.client]] });
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ ok: true, message: "No matching vehicles for today to update" });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        data: updates,
        valueInputOption: "RAW",
      },
    });

    return NextResponse.json({ ok: true, updated: updates.length / 3 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}