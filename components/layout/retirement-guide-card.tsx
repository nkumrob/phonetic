// Affiliate card: Augusta Precious Metals' free gold/silver IRA guide, shown under the site header.
// Self-styled (own background and colours) so it reads on any page. Copy kept inside Augusta's affiliate rules:
// no fear, urgency, price or "protect/hedge/diversify" claims, no advice.
const URL =
  "https://learn.augustapreciousmetals.com/apm-aff-lp-1-v3?apmtrkr_cid=1696&aff_id=5459&sub_id=web-natophonetic";

export function RetirementGuideCard() {
  return (
    <aside aria-label="Sponsored" style={{ maxWidth: 1100, margin: "12px auto", padding: "0 16px", position: "relative", zIndex: 1 }}>
      <div
        style={{
          background: "#FFF7E3",
          color: "#1F1A0E",
          border: "1px solid #E8D59A",
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px 16px",
          justifyContent: "space-between",
          boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, lineHeight: 1.35, color: "#1F1A0E" }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7A6A3A", marginRight: 8 }}>
              Sponsored
            </span>
            Put your hard-earned retirement money to work
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 14, lineHeight: 1.45, color: "#4A4130" }}>
            Augusta Precious Metals&apos; free guide explains how a gold or silver IRA works.
          </p>
        </div>
        <a
          href={URL}
          target="_blank"
          rel="sponsored noopener noreferrer"
          style={{
            flex: "0 0 auto",
            padding: "9px 16px",
            borderRadius: 9,
            background: "#C9A227",
            color: "#1A1406",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Get the free guide &rarr;
        </a>
        <p style={{ flex: "1 1 100%", margin: 0, fontSize: 11, lineHeight: 1.4, color: "#6B6150" }}>
          Affiliate link: we may earn a commission at no cost to you. General information only, not financial, tax or
          investment advice.
        </p>
      </div>
    </aside>
  );
}
