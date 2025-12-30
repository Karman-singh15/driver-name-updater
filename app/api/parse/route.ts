import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY env var" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a data extraction expert. Parse the following driver information text and extract structured data.

For each driver entry, extract:
- Vehicle number/registration (e.g., DL51EV1819, HR55AT4434)
- Driver name
- Phone number (10 digits)
- Client/Company name

Return the data as a JSON array with this exact structure:
[
  {
    "vehicle": "DL51EV1819",
    "name": "Lalender",
    "mobile": "8279778176",
    "client": "DTDC"
  },
  ...
]

Rules:
- Vehicle numbers are alphanumeric codes like DL51EV1819
- Extract exactly 10 digit phone numbers
- Client is the company/delivery partner name
- If any field is missing, use null
- Return ONLY the JSON array, no other text

Text to parse:
${text}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse response from Gemini" }, { status: 400 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and clean up response
    const cleaned = parsed.map((entry: any) => ({
      vehicle: entry.vehicle || "(unknown)",
      name: entry.name || "(unknown)",
      mobile: entry.mobile || "(unknown)",
      client: entry.client || "(unknown)",
    }));

    return NextResponse.json({ data: cleaned });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}