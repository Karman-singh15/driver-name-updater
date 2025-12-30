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
    const {
      dateColumnName,
      vehicleColumnName,
      locationColumnName,
      serialNumberColumnName,
      clientColumnName,
      driverNameColumnName,
      phoneColumnName,
      date,
      vehicles,
    } = body;

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

    const serialNumberCol = findHeaderIndex([serialNumberColumnName, "S.No", "serial", "sno"]);
    const dateCol = findHeaderIndex([dateColumnName, "date", "start date"]);
    const vehicleCol = findHeaderIndex([vehicleColumnName, "vehicle", "vehicle no", "registration"]);
    const locationCol = findHeaderIndex([locationColumnName, "hub", "location", "zone"]);
    const clientCol = findHeaderIndex([clientColumnName, "client", "company", "customer"]);
    const driverNameCol = findHeaderIndex([driverNameColumnName, "driver name", "driver", "name"]);
    const phoneCol = findHeaderIndex([phoneColumnName, "phone", "mobile", "contact"]);

    if (dateCol === -1) {
      return NextResponse.json({ error: `Could not find date column in header` }, { status: 400 });
    }
    if (vehicleCol === -1) {
      return NextResponse.json({ error: `Could not find vehicle column in header` }, { status: 400 });
    }
    if (locationCol === -1) {
      return NextResponse.json({ error: `Could not find location column in header` }, { status: 400 });
    }
    if (serialNumberCol === -1) {
      return NextResponse.json({ error: `Could not find serial number column in header` }, { status: 400 });
    }

    // Find the last row with data
    let lastRowWithData = 1;
    for (let r = values.length - 1; r > 0; r--) {
      const row = values[r];
      if (row && row.some((cell: any) => cell && String(cell).trim())) {
        lastRowWithData = r;
        break;
      }
    }

    const startRowNumber = lastRowWithData + 2;

    const updates: Array<{ range: string; values: any[][] }> = [];

    // Build updates for each vehicle
    vehicles.forEach((vehicle: any, index: number) => {
      const rowNumber = startRowNumber + index;
      const serialNumber = index + 1;

      // Serial Number
      const serialRange = `${sheetName}!${colToLetter(serialNumberCol)}${rowNumber}`;
      updates.push({ range: serialRange, values: [[serialNumber]] });

      // Date
      const dateRange = `${sheetName}!${colToLetter(dateCol)}${rowNumber}`;
      updates.push({ range: dateRange, values: [[date]] });

      // Vehicle
      const vehicleRange = `${sheetName}!${colToLetter(vehicleCol)}${rowNumber}`;
      updates.push({ range: vehicleRange, values: [[vehicle.vehicle]] });

      // Location
      const locationRange = `${sheetName}!${colToLetter(locationCol)}${rowNumber}`;
      updates.push({ range: locationRange, values: [[vehicle.location]] });

      // Client (only if column exists)
      if (clientCol !== -1 && vehicle.client) {
        const clientRange = `${sheetName}!${colToLetter(clientCol)}${rowNumber}`;
        updates.push({ range: clientRange, values: [[vehicle.client]] });
      }

      // Driver Name (only if column exists)
      if (driverNameCol !== -1 && vehicle.driverName) {
        const driverRange = `${sheetName}!${colToLetter(driverNameCol)}${rowNumber}`;
        updates.push({ range: driverRange, values: [[vehicle.driverName]] });
      }

      // Phone (only if column exists)
      if (phoneCol !== -1 && vehicle.phone) {
        const phoneRange = `${sheetName}!${colToLetter(phoneCol)}${rowNumber}`;
        updates.push({ range: phoneRange, values: [[vehicle.phone]] });
      }
    });

    if (updates.length === 0) {
      return NextResponse.json({ ok: true, message: "No vehicles to insert" });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        data: updates,
        valueInputOption: "RAW",
      },
    });

    return NextResponse.json({ ok: true, inserted: vehicles.length });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}