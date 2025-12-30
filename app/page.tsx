"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Array<any>>([]);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [todayDate, setTodayDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e?: any) {
    if (e && e.preventDefault) e.preventDefault();
    
    if (!input.trim()) {
      setUpdateStatus("Please paste some text first");
      return;
    }

    setIsLoading(true);
    setUpdateStatus("Parsing with Gemini...");

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to parse");

      setResults(json.data);
      setUpdateStatus(null);
    } catch (err: any) {
      setUpdateStatus(`Error: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  }

  function copyJSON() {
    const payload = JSON.stringify(results, null, 2);
    navigator.clipboard.writeText(payload);
  }

  function handleResultChange(index: number, field: string, value: string) {
    const updated = [...results];
    updated[index] = { ...updated[index], [field]: value };
    setResults(updated);
  }

  function addRow() {
    setResults([
      ...results,
      { vehicle: "", name: "", mobile: "", client: "" },
    ]);
  }

  function removeRow(index: number) {
    setResults(results.filter((_, i) => i !== index));
  }

  async function startDay() {
    setUpdateStatus(null);

    const dateColumnName = "Date";
    const vehicleColumnName = "Vehicle No";
    const locationColumnName = "Hub";
    const serialNumberColumnName = "S.No";
    const clientColumnName = "Client";
    const driverNameColumnName = "Driver";
    const phoneColumnName = "Mobile Number";

    const today = new Date();
    const dateString = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
    setTodayDate(dateString);

    // All 178 vehicle entries
    const vehicleData = [
      { vehicle: "DL51EV1698", location: "Kundli" },
      { vehicle: "DL51EV5025", location: "Kundli" },
      { vehicle: "DL51EV6807", location: "Kundli" },
      { vehicle: "DL51EV6853", location: "Kundli" },
      { vehicle: "DL51EV7432", location: "Kundli" },
      { vehicle: "DL51EV7488", location: "Kundli" },
      { vehicle: "DL51EV7631", location: "Kundli" },
      { vehicle: "DL51EV7700", location: "Kundli" },
      { vehicle: "HR55AV0543", location: "Kundli" },
      { vehicle: "HR55AT0695", location: "Kundli" },
      { vehicle: "HR55AT1214", location: "Kundli" },
      { vehicle: "HR55AV1402", location: "Kundli" },
      { vehicle: "HR55AV1658", location: "Kundli" },
      { vehicle: "HR55AV2299", location: "Kundli" },
      { vehicle: "HR55AV2832", location: "Kundli" },
      { vehicle: "HR55AV2829", location: "Kundli" },
      { vehicle: "HR55AV3320", location: "Kundli" },
      { vehicle: "HR55AV3905", location: "Kundli" },
      { vehicle: "HR55AT5076", location: "Kundli" },
      { vehicle: "HR55AV5746", location: "Kundli" },
      { vehicle: "HR55AT7014", location: "Kundli" },
      { vehicle: "HR55AV7268", location: "Kundli" },
      { vehicle: "DL51EV7414", location: "Kundli" },
      { vehicle: "HR55AT9175", location: "Kundli" },
      { vehicle: "HR55AT9908", location: "Kundli" },
      { vehicle: "HR55AT1791", location: "Kundli" },
      { vehicle: "HR55AV1823", location: "Narela" },
      { vehicle: "HR55AV4277", location: "Kundli" },
      { vehicle: "HR55AV7999", location: "Kundli" },
      { vehicle: "DL51EV6248", location: "Kundli" },
      { vehicle: "HR55AV1576", location: "Kundli" },
      { vehicle: "HR55AV8592", location: "Narela" },
      { vehicle: "HR55AT9494", location: "Kundli" },
      { vehicle: "HR55AV2369", location: "Faridabad" },
      { vehicle: "DL51EV1617", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV1683", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV1642", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV5018", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV5023", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV6146", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV6806", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV6892", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV7305", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV7337", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV7346", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV7455", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV7461", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV7469", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV7479", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV7492", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV7493", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV7517", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV7535", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV7555", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV7877", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV8209", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV0341", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV0325", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AT0624", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV0944", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV1253", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AT1450", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AT2553", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV2597", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV2620", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV3418", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV4239", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AT4767", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV4987", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV5476", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AT5528", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV6079", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV6295", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AT6827", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AT6874", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AT6947", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV7042", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV7479", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV7633", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AT8219", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV8663", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV8684", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV8765", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AT8781", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV8805", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV8866", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV9026", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV9243", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV9355", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV9490", location: "Sec 24 Dwarka" },
      { vehicle: "HR55AV9560", location: "Sec 24 Dwarka" },
      { vehicle: "DL51EV1562", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV1635", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV1641", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV1643", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV1652", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV1675", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV1802", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV1818", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV1819", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV1824", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV1830", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV1841", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV1878", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV1888", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV1952", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV2004", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV4145", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV4147", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV4156", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV4160", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV4166", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV6150", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV6298", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV6802", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV6933", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV6977", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7320", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7411", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7415", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7418", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7421", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7447", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7458", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7462", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7477", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7495", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7497", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7522", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7565", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7673", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7695", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7690", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7881", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7886", location: "Waniz" },
      { vehicle: "DL51EV8064", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD8245", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD8257", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV8421", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV8477", location: "Sec 18 Gurgaon" },
      { vehicle: "HR55AT0845", location: "Sec 18 Gurgaon" },
      { vehicle: "HR55AV2803", location: "Sec 18 Gurgaon" },
      { vehicle: "HR55AV3721", location: "Sec 18 Gurgaon" },
      { vehicle: "HR55AT4434", location: "Sec 18 Gurgaon" },
      { vehicle: "HR55AV4478", location: "Sec 18 Gurgaon" },
      { vehicle: "HR55AV5757", location: "Sec 18 Gurgaon" },
      { vehicle: "HR55AV7319", location: "Sec 18 Gurgaon" },
      { vehicle: "HR55AV7347", location: "Sec 18 Gurgaon" },
      { vehicle: "HR55AV9118", location: "Sec 18 Gurgaon" },
      { vehicle: "HR55AT9879", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD6026", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD6684", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51EV7873", location: "Waniz" },
      { vehicle: "DL51EV5047", location: "Waniz" },
      { vehicle: "DL51EV5069", location: "Waniz" },
      { vehicle: "DL51EV6948", location: "Waniz" },
      { vehicle: "DL51EV6109", location: "Waniz" },
      { vehicle: "DL51EV7472", location: "YU" },
      { vehicle: "HR55AV0493", location: "Gracious Logistics" },
      { vehicle: "DL51GD3312", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD3315", location: "Workshop" },
      { vehicle: "DL51GD3323", location: "Sec 24 Dwarka" },
      { vehicle: "DL51GD3325", location: "Sec 24 Dwarka" },
      { vehicle: "DL51GD3342", location: "Sec 24 Dwarka" },
      { vehicle: "DL51GD3364", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD3380", location: "Sec 24 Dwarka" },
      { vehicle: "DL51GD3383", location: "Sec 24 Dwarka" },
      { vehicle: "DL51GD3392", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD3454", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD6063", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD6083", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD6602", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD6605", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD6621", location: "Workshop" },
      { vehicle: "DL51GD6647", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD6696", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD6041", location: "Sec 18 Gurgaon" },
      { vehicle: "DL51GD6639", location: "Sec 18 Gurgaon" },
    ];

    setUpdateStatus("Starting day...");
    try {
      const res = await fetch("/api/start-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateColumnName,
          vehicleColumnName,
          locationColumnName,
          serialNumberColumnName,
          clientColumnName,
          driverNameColumnName,
          phoneColumnName,
          date: dateString,
          vehicles: vehicleData,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || JSON.stringify(json));
      setUpdateStatus(`Started day: ${json.inserted || 0} entries added`);
    } catch (err: any) {
      setUpdateStatus(`Error: ${err.message || err}`);
    }
  }

  async function updateTodayDrivers() {
    setUpdateStatus(null);

    const entries = results
      .filter((r) => r.vehicle && r.vehicle !== "(unknown)" && r.vehicle.length > 0)
      .map((r) => ({
        vehicle: r.vehicle,
        name: r.name || "",
        mobile: r.mobile || "",
        client: r.client || "",
      }));

    if (entries.length === 0) {
      setUpdateStatus("No valid vehicle entries to update.");
      return;
    }

    setUpdateStatus("Updating today's drivers...");
    try {
      const res = await fetch("/api/update-today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          entries,
          date: todayDate,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || JSON.stringify(json));
      setUpdateStatus(`Updated ${json.updated || 0} entries for today`);
    } catch (err: any) {
      setUpdateStatus(`Error: ${err.message || err}`);
    }
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
          <button type="submit" disabled={isLoading} style={{ padding: "8px 12px", cursor: "pointer", opacity: isLoading ? 0.6 : 1 }}>
            {isLoading ? "Parsing..." : "Parse"}
          </button>
          <button type="button" onClick={startDay} style={{ padding: "8px 12px", backgroundColor: "#28a745", color: "white", cursor: "pointer" }}>
            Start the Day
          </button>
          <button type="button" onClick={() => { setInput(""); setResults([]); }} style={{ padding: "8px 12px", cursor: "pointer" }}>
            Clear
          </button>
          <button type="button" onClick={copyJSON} disabled={results.length === 0} style={{ padding: "8px 12px", cursor: "pointer", opacity: results.length === 0 ? 0.6 : 1 }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div>
                <button
                  type="button"
                  onClick={updateTodayDrivers}
                  style={{ padding: "8px 12px", marginRight: 8, cursor: "pointer", backgroundColor: "#0056b3", color: "white" }}
                >
                  Update Today's Drivers
                </button>
                <button
                  type="button"
                  onClick={addRow}
                  style={{ padding: "8px 12px", marginRight: 8, cursor: "pointer", backgroundColor: "#17a2b8", color: "white" }}
                >
                  + Add Row
                </button>
                <button type="button" onClick={() => { setInput(""); setResults([]); setUpdateStatus(null); }} style={{ padding: "8px 12px", cursor: "pointer" }}>
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
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Driver Name</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Phone</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Client</th>
                  <th style={{ textAlign: "center", borderBottom: "1px solid #ddd", padding: 8, width: 60 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                      <input type="text" value={r.vehicle} onChange={(e) => handleResultChange(i, "vehicle", e.target.value)} style={{ width: "100%", border: "1px solid #ccc", padding: 4, fontSize: 14, boxSizing: "border-box", cursor: "text" }} />
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                      <input type="text" value={r.name} onChange={(e) => handleResultChange(i, "name", e.target.value)} style={{ width: "100%", border: "1px solid #ccc", padding: 4, fontSize: 14, boxSizing: "border-box", cursor: "text" }} />
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                      <input type="text" value={r.mobile} onChange={(e) => handleResultChange(i, "mobile", e.target.value)} style={{ width: "100%", border: "1px solid #ccc", padding: 4, fontSize: 14, boxSizing: "border-box", cursor: "text" }} />
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                      <input type="text" value={r.client} onChange={(e) => handleResultChange(i, "client", e.target.value)} style={{ width: "100%", border: "1px solid #ccc", padding: 4, fontSize: 14, boxSizing: "border-box", cursor: "text" }} />
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        style={{ padding: "4px 8px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: 12 }}
                      >
                        Remove
                      </button>
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
