export default function PageHeader({ title, sub, actions }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      marginBottom: 26, flexWrap: "wrap", gap: 12,
    }}>
      <div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 21, fontWeight: 900,
          color: "#e2e8f0", margin: 0, letterSpacing: "-0.02em",
        }}>
          {title}
        </h1>
        {sub && (
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: 12,
            color: "#475569", margin: "5px 0 0", letterSpacing: "0.01em",
          }}>
            {sub}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {actions}
        </div>
      )}
    </div>
  );
}