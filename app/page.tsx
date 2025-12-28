"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Array<any>>([]);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  function parseText(text: string) {
    const lines = text.split(/\r?\n/).map((l) => l.trim());

    const nameLineRe = /(?:Maa:\s*Name|Maa:|Name)\s*[:\-]?\s*(.+)/i;
    const mobileRe = /(\d{10})/;
    const vehicleRe = /([A-Z]{1,2}\s*\d{1,2}[A-Z]{0,2}\s*\d{3,4})/i;
    const clientRe = /\b(DTDC|Apex|Durgapuri|Durgapur)\b/i;

    const resultsArr: Array<any> = [];

    let current: any = { name: null, mobile: null, vehicle: null, client: null, raw: [] };

    function pushCurrentIfAny() {
      if (current.raw.length === 0) return;
      // only push if we have at least one identifying field
      if (!(current.name || current.mobile || current.vehicle)) {
        // discard entries that only contain e.g. a stray client line
        current = { name: null, mobile: null, vehicle: null, client: null, raw: [] };
        return;
      }
      resultsArr.push({
        name: current.name || null,
        mobile: current.mobile || null,
        vehicle: current.vehicle || null,
        client: current.client || null,
        raw: current.raw.join(" \n "),
      });
      current = { name: null, mobile: null, vehicle: null, client: null, raw: [] };
    }

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        // blank line separates entries
        pushCurrentIfAny();
        continue;
      }

      // If a new Name line appears and current already has data, start a new record
      const nameLineMatch = line.match(nameLineRe);
      if (nameLineMatch) {
        if (current.raw.length && (current.name || current.mobile || current.vehicle)) {
          pushCurrentIfAny();
        }
        current.name = nameLineMatch[1].trim();
        current.raw.push(line);
        continue;
      }

      // Mobile
      const mm = line.match(mobileRe);
      if (mm) {
        if (!current.mobile) current.mobile = mm[1];
        current.raw.push(line);
        continue;
      }

      // Vehicle
      const vm = line.match(vehicleRe);
      if (vm) {
        if (!current.vehicle) current.vehicle = vm[1].replace(/\s+/g, "").toUpperCase();
        current.raw.push(line);
        // if vehicle line likely ends the entry, push
        if (current.name || current.mobile || current.vehicle) {
          pushCurrentIfAny();
        }
        continue;
      }

      // Client
      const cm = line.match(clientRe);
      if (cm) {
        // if no current data but we already have a previous result, attach client to it
        if (!current.raw.length && resultsArr.length) {
          const last = resultsArr[resultsArr.length - 1];
          if (!last.client) last.client = cm[1];
        } else {
          if (!current.client) current.client = cm[1];
          current.raw.push(line);
        }
        continue;
      }

      // generic heuristics: lines starting with 'Mob' or 'Mobile' or 'Vehicle' or 'Name -'
      if (/^Mob|Mobile|Mobile no|Mob no|Mob\s+no/i.test(line)) {
        const m = line.match(/(\d{10})/);
        if (m && !current.mobile) current.mobile = m[1];
        current.raw.push(line);
        continue;
      }

      if (/^Vehicle|^Vehicle no|Vehicle no\.|Vehicle no -/i.test(line)) {
        const m = line.match(/([A-Z0-9\-\s]{6,12})/i);
        if (m && !current.vehicle) current.vehicle = m[1].replace(/[^A-Z0-9]/gi, "").toUpperCase();
        current.raw.push(line);
        pushCurrentIfAny();
        continue;
      }

      // otherwise attach to current raw; if line contains 'Name -' inside, try extract
      const inlineName = line.match(/Name\s*[:\-]?\s*(.+)/i);
      if (inlineName) {
        if (current.raw.length && (current.name || current.mobile || current.vehicle)) {
          pushCurrentIfAny();
        }
        current.name = inlineName[1].trim();
        current.raw.push(line);
        continue;
      }

      // fallback: attach any other text
      current.raw.push(line);
    }

    pushCurrentIfAny();

    const mapped = resultsArr.map((r) => ({
      vehicle: r.vehicle || "(unknown)",
      name: r.name || "(unknown)",
      mobile: r.mobile || "(unknown)",
    }));

    setResults(mapped);
  }

  function handleSubmit(e?: any) {
    if (e && e.preventDefault) e.preventDefault();
    parseText(input);
  }

  function copyJSON() {
    const payload = JSON.stringify(results, null, 2);
    navigator.clipboard.writeText(payload);
  }

  function handleResultChange(index: number, field: "vehicle" | "name" | "mobile", value: string) {
    const updated = [...results];
    updated[index] = { ...updated[index], [field]: value };
    setResults(updated);
  }

  return (
    <main style={{ padding: 24, fontFamily: "Inter, Roboto, sans-serif" }}>
      <h1 style={{ marginBottom: 12 }}>Driver Name Updater — Paste text to parse</h1>

      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste the raw text here..."
          rows={12}
          style={{ width: "100%", padding: 12, fontSize: 14, boxSizing: "border-box" }}
        />

        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button type="submit" style={{ padding: "8px 12px" }}>
            Parse
          </button>
          <button
            type="button"
            onClick={() => {
              setInput("");
              setResults([]);
            }}
            style={{ padding: "8px 12px" }}
          >
            Clear
          </button>
          <button type="button" onClick={copyJSON} style={{ padding: "8px 12px" }}>
            Copy JSON
          </button>
        </div>
      </form>

      <section style={{ marginTop: 20 }}>
        <h2>Results</h2>
        {results.length === 0 ? (
          <p style={{ color: "#666" }}>No results yet — paste text and press Parse.</p>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <button
                  type="button"
                  onClick={async () => {
                    setUpdateStatus(null);
                    const entries = results
                      .filter((r) => r.vehicle && r.vehicle !== "(unknown)")
                      .map((r) => ({ vehicle: r.vehicle, name: r.name, mobile: r.mobile }));
                    if (entries.length === 0) {
                      setUpdateStatus("No valid vehicle entries to update.");
                      return;
                    }
                    setUpdateStatus("Updating...");
                    try {
                      const res = await fetch("/api/update", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ entries }),
                      });
                      const json = await res.json();
                      if (!res.ok) throw new Error(json.error || JSON.stringify(json));
                      setUpdateStatus(`Updated ${json.updated || 0} entries`);
                    } catch (err: any) {
                      setUpdateStatus(`Error: ${err.message || err}`);
                    }
                  }}
                  style={{ padding: "8px 12px", marginRight: 8 }}
                >
                  Update Google Sheet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInput("");
                    setResults([]);
                    setUpdateStatus(null);
                  }}
                  style={{ padding: "8px 12px" }}
                >
                  Clear
                </button>
              </div>

              <div style={{ textAlign: "right", minWidth: 240 }}>
                {updateStatus && <div style={{ color: "var(--foreground, #222)" }}>{updateStatus}</div>}
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Vehicle</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Name</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Mobile</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                      <input
                        type="text"
                        value={r.vehicle}
                        onChange={(e) => handleResultChange(i, "vehicle", e.target.value)}
                        style={{
                          width: "100%",
                          border: "1px solid #ccc",
                          padding: 4,
                          fontSize: 14,
                          boxSizing: "border-box",
                        }}
                      />
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => handleResultChange(i, "name", e.target.value)}
                        style={{
                          width: "100%",
                          border: "1px solid #ccc",
                          padding: 4,
                          fontSize: 14,
                          boxSizing: "border-box",
                        }}
                      />
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                      <input
                        type="text"
                        value={r.mobile}
                        onChange={(e) => handleResultChange(i, "mobile", e.target.value)}
                        style={{
                          width: "100%",
                          border: "1px solid #ccc",
                          padding: 4,
                          fontSize: 14,
                          boxSizing: "border-box",
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </main>
  );
}
