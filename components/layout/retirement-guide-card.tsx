// Affiliate card: Augusta Precious Metals' free gold/silver IRA guide.
// Copy kept inside Augusta's affiliate rules: no fear, urgency, price or "protect/hedge/diversify" claims, no advice.
const URL =
  "https://learn.augustapreciousmetals.com/apm-aff-lp-1-v3?apmtrkr_cid=1696&aff_id=5459&sub_id=web-natophonetic";

export function RetirementGuideCard() {
  return (
    <aside
      aria-label="Sponsored"
      style={{
        maxWidth: 880,
        margin: "48px auto 0",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          border: "1px solid rgba(127,127,127,0.35)",
          borderRadius: 14,
          padding: "20px 22px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 16,
          justifyContent: "space-between",
          color: "inherit",
        }}
      >
        <div style={{ flex: "1 1 360px", minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.6 }}>
            Sponsored
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>
            Put your hard-earned retirement money to work
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 15, lineHeight: 1.5, opacity: 0.8 }}>
            Augusta Precious Metals&apos; free guide explains how a gold or silver IRA works.
          </p>
        </div>
        <a
          href={URL}
          target="_blank"
          rel="sponsored noopener noreferrer"
          style={{
            flex: "0 0 auto",
            padding: "11px 18px",
            borderRadius: 10,
            background: "#C9A227",
            color: "#1a1406",
            fontWeight: 700,
            fontSize: 15,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Get the free guide &rarr;
        </a>
        <p style={{ flex: "1 1 100%", margin: 0, fontSize: 12, lineHeight: 1.5, opacity: 0.55 }}>
          Affiliate link: we may earn a commission at no cost to you. General information only, not financial, tax or
          investment advice.
        </p>
      </div>
    </aside>
  );
}
