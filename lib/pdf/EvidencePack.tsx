import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const NAVY = "#0a1628";
const BLUE = "#0f2240";
const BLUE_MID = "#1a3a6b";
const BLUE_LIGHT = "#2563b0";
const GLACIER = "#4a90d9";
const ICE = "#8bb8e8";
const SNOW = "#e8f2fc";
const WHITE = "#f4f8fd";
const MUTED = "#5c85b8";
const BODY = "#2a4a72";
const BORDER = "#c8ddf2";
const SAGE = "#5c9e8a";
const WARN = "#c9914a";
const DANGER = "#b5604e";

const styles = StyleSheet.create({
  page: {
    backgroundColor: WHITE,
    padding: 44,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: NAVY,
  },
  header: {
    borderBottom: `2px solid ${BLUE}`,
    paddingBottom: 14,
    marginBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  brand: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  brandAccent: {
    color: GLACIER,
  },
  brandSub: {
    fontSize: 8,
    color: MUTED,
    letterSpacing: 1.6,
    fontFamily: "Helvetica",
  },
  docRef: {
    fontSize: 8,
    color: MUTED,
    fontFamily: "Helvetica",
    textAlign: "right",
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: NAVY,
  },
  subtitle: {
    fontSize: 11,
    color: BODY,
    marginBottom: 20,
    fontFamily: "Helvetica",
  },
  meta: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
    backgroundColor: SNOW,
    padding: 14,
    borderRadius: 6,
    border: `1px solid ${BORDER}`,
  },
  metaItem: { flex: 1 },
  metaLabel: {
    fontSize: 7,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
    fontFamily: "Helvetica",
  },
  metaValue: {
    fontSize: 9,
    color: NAVY,
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: `1px solid ${BORDER}`,
    paddingBottom: 5,
    marginBottom: 10,
    marginTop: 18,
  },
  obligationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottom: `1px solid ${BORDER}`,
    backgroundColor: WHITE,
  },
  obligationRowAlt: {
    backgroundColor: SNOW,
  },
  obligationLeft: { flex: 1 },
  articleTag: {
    fontSize: 7,
    color: GLACIER,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#e8f2fc",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    marginBottom: 3,
    alignSelf: "flex-start",
    border: `1px solid ${BORDER}`,
  },
  obligationName: {
    fontSize: 9,
    color: NAVY,
    fontFamily: "Helvetica-Bold",
  },
  obligationFramework: {
    fontSize: 8,
    color: MUTED,
    marginTop: 2,
    fontFamily: "Helvetica",
  },
  pctContainer: {
    alignItems: "flex-end",
    width: 80,
  },
  pctText: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  barTrack: {
    width: 60,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: SNOW,
    border: `1px solid ${BORDER}`,
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 7.5,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontFamily: "Helvetica",
    textAlign: "center",
  },
  legalBox: {
    backgroundColor: "#f0f6ff",
    border: `1px solid ${BORDER}`,
    borderRadius: 6,
    padding: 12,
    marginBottom: 18,
  },
  legalText: {
    fontSize: 8.5,
    color: BODY,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 44,
    right: 44,
    borderTop: `1px solid ${BORDER}`,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7.5,
    color: MUTED,
    fontFamily: "Helvetica",
  },
  statusBadge: {
    fontSize: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontFamily: "Helvetica-Bold",
  },
});

function getPctColor(pct: number) {
  if (pct >= 80) return SAGE;
  if (pct >= 40) return WARN;
  return DANGER;
}

export function EvidencePack({
  systemName,
  vendor,
  riskLevel,
  obligations,
  owner,
  generatedAt,
}: {
  systemName: string;
  vendor: string;
  riskLevel: string;
  obligations: { article: string; name: string; framework: string; pct: number }[];
  owner: string;
  generatedAt: string;
}) {
  const overall =
    obligations.length > 0
      ? Math.round(obligations.reduce((s, o) => s + o.pct, 0) / obligations.length)
      : 0;
  const complete = obligations.filter((o) => o.pct >= 100).length;
  const inProgress = obligations.filter((o) => o.pct > 0 && o.pct < 100).length;
  const pending = obligations.filter((o) => o.pct === 0).length;
  const docRef = `NORA-ART11-${systemName.replace(/\s+/g,'-').toUpperCase().slice(0,8)}-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              nora<Text style={styles.brandAccent}>.</Text>comply
            </Text>
            <Text style={styles.brandSub}>EU AI Act Compliance Evidence Pack</Text>
          </View>
          <View>
            <Text style={styles.docRef}>{docRef}</Text>
            <Text style={styles.docRef}>{generatedAt}</Text>
            <Text style={styles.docRef}>Reg. (EU) 2024/1689 · Art. 11</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{systemName}</Text>
        <Text style={styles.subtitle}>
          {vendor} · {riskLevel} · Technical documentation under Art. 11, Annex IV
        </Text>

        {/* Legal notice */}
        <View style={styles.legalBox}>
          <Text style={styles.legalText}>
            This document constitutes the technical documentation required under Article 11 and Annex IV of Regulation (EU)
            2024/1689 (EU AI Act). It records the compliance posture of the named AI system as at the date of generation,
            and may be presented to supervisory authorities as evidence of compliance obligations tracking.
          </Text>
        </View>

        {/* Meta */}
        <View style={styles.meta}>
          {[
            { label: "System", value: systemName },
            { label: "Vendor", value: vendor || "Internal" },
            { label: "Risk level", value: riskLevel },
            { label: "Owner", value: owner },
            { label: "Overall posture", value: `${overall}%` },
          ].map((m) => (
            <View key={m.label} style={styles.metaItem}>
              <Text style={styles.metaLabel}>{m.label}</Text>
              <Text style={styles.metaValue}>{m.value}</Text>
            </View>
          ))}
        </View>

        {/* Summary stats */}
        <View style={styles.summaryGrid}>
          {[
            { value: obligations.length, label: "Total obligations" },
            { value: complete, label: "Complete", color: SAGE },
            { value: inProgress, label: "In progress", color: WARN },
            { value: pending, label: "Pending", color: DANGER },
            { value: `${overall}%`, label: "Overall score", color: getPctColor(overall) },
          ].map((s) => (
            <View key={s.label} style={styles.summaryCard}>
              <Text style={[styles.summaryValue, s.color ? { color: s.color } : {}]}>{s.value}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Obligations table */}
        <Text style={styles.sectionTitle}>Obligation compliance status</Text>

        {/* Table header */}
        <View style={[styles.obligationRow, { backgroundColor: BLUE }]}>
          <View style={styles.obligationLeft}>
            <Text style={[styles.obligationName, { color: "#ffffff", fontSize: 8 }]}>Obligation</Text>
          </View>
          <View style={styles.pctContainer}>
            <Text style={[styles.pctText, { color: "#ffffff", fontSize: 8 }]}>Progress</Text>
          </View>
        </View>

        {obligations.map((ob, i) => (
          <View
            key={ob.article}
            style={[styles.obligationRow, i % 2 === 1 ? styles.obligationRowAlt : {}]}
          >
            <View style={styles.obligationLeft}>
              <Text style={styles.articleTag}>{ob.article}</Text>
              <Text style={styles.obligationName}>{ob.name}</Text>
              <Text style={styles.obligationFramework}>{ob.framework}</Text>
            </View>
            <View style={styles.pctContainer}>
              <Text style={[styles.pctText, { color: getPctColor(ob.pct) }]}>
                {ob.pct}%
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${ob.pct}%`, backgroundColor: getPctColor(ob.pct) },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            nora.comply · noracomply.com · {docRef}
          </Text>
          <Text style={styles.footerText}>
            Generated {generatedAt} · Regulation (EU) 2024/1689
          </Text>
        </View>
      </Page>
    </Document>
  );
}
