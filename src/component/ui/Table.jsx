export default function Table({ columns, data, onRowClick, emptyMsg = "No records found." }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {columns.map(c => (
              <th key={c.key} style={{
                padding: "9px 14px", textAlign: "left",
                fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                color: "#475569", textTransform: "uppercase",
                letterSpacing: "0.07em", whiteSpace: "nowrap",
              }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{
                padding: "44px 14px", textAlign: "center",
                fontFamily: "'Inter', sans-serif", fontSize: 13,
                color: "#475569",
              }}>
                {emptyMsg}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row._id || row.userId || i}
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.035)",
                  cursor: onRowClick ? "pointer" : "default",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => {
                  if (onRowClick) e.currentTarget.style.background = "rgba(37,99,235,0.04)";
                }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                {columns.map(c => (
                  <td key={c.key} style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                    {c.render
                      ? c.render(row[c.key], row)
                      : <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#64748b" }}>{row[c.key] ?? "—"}</span>
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}