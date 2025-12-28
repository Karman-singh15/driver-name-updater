import { NextResponse } from "next/server";
import { google } from "googleapis";

// POST body: { entries: [{ vehicle, name, mobile }] }
// Environment variables required:
// - GOOGLE_SERVICE_ACCOUNT_KEY: JSON string of service account key
// - SHEET_ID: spreadsheet id
// - SHEET_NAME: name of the sheet/tab (e.g. "Sheet1")

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
    const entries: Array<{ vehicle: string; name: string; mobile: string }> = body.entries || [];

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

    // Read sheet data (A:Z)
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const values = readRes.data.values || [];
    if (values.length === 0) {
      return NextResponse.json({ error: "Sheet is empty" }, { status: 400 });
    }

    // header is first row
    const header = values[0].map((h: any) => String(h || "").trim());

    // find vehicle/name/mobile columns by header name heuristics
    function findHeaderIndex(possibleNames: string[]) {
      for (const name of possibleNames) {
        const idx = header.findIndex((h: string) => new RegExp(name, "i").test(h));
        if (idx >= 0) return idx;
      }
      return -1;
    }

    const vehicleCol = findHeaderIndex(["vehicle", "vehicle no", "vehicle number", "car", "reg", "registration"]);
    const nameCol = findHeaderIndex([ "driver name", "driver"]);
    const mobileCol = findHeaderIndex(["mobile", "phone", "mobile no", "mobile number", "contact"]);

    if (vehicleCol === -1) {
      return NextResponse.json({ error: "Could not find vehicle column in header" }, { status: 400 });
    }
    if (nameCol === -1) {
      return NextResponse.json({ error: "Could not find name column in header" }, { status: 400 });
    }
    if (mobileCol === -1) {
      return NextResponse.json({ error: "Could not find mobile column in header" }, { status: 400 });
    }

    const updates: Array<{ range: string; values: any[][] }> = [];

    // build map of vehicle -> row index
    const vehicleMap = new Map<string, number>();
    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      const cell = String((row[vehicleCol] || "")).replace(/\s+/g, "").toUpperCase();
      if (cell) vehicleMap.set(cell, r + 1); // sheet rows are 1-based
    }

    for (const e of entries) {
      const keyVehicle = String(e.vehicle || "").replace(/\s+/g, "").toUpperCase();
      if (!keyVehicle) continue;
      const rowNumber = vehicleMap.get(keyVehicle);
      if (!rowNumber) {
        // vehicle not found; skip or optionally append — we skip
        continue;
      }

      const nameRange = `${sheetName}!${colToLetter(nameCol)}${rowNumber}`;
      const mobileRange = `${sheetName}!${colToLetter(mobileCol)}${rowNumber}`;

      updates.push({ range: nameRange, values: [[e.name || ""]] });
      updates.push({ range: mobileRange, values: [[e.mobile || ""]] });
    }

    if (updates.length === 0) {
      return NextResponse.json({ ok: true, message: "No matching vehicles to update" });
    }

    // batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        data: updates,
        valueInputOption: "RAW",
      },
    });

    return NextResponse.json({ ok: true, updated: updates.length / 2 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
