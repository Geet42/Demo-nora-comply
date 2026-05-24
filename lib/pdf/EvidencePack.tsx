import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FBF6EF",
    padding: 44,
    fontSize: 10,
    fontFamily: "Times-Roman",
    color: "#221C16",
  },
  header: {
    borderBottom: "2px solid #B87352",
    paddingBottom: 14,
    marginBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  brand: {
    fontSize: 20,
    fontFamily: "Times-Italic",
    color: "#221C16",
  },
  brandSub: {
    fontSize: 8,
    color: "#8A7E70",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 26,
    fontFamily: "Times-Roman",
    marginBottom: 6,
    color: "#221C16",
  },
  subtitle: {
    fontSize: 11,
    color: "#5A4E42",
    marginBottom: 22,
    fontFamily: "Times-Italic",
  },
  meta: {
    flexDirection: "row",
    gap: 18,
    marginBottom: 22,
    backgroundColor: "#F2EBE0",
    padding: 14,
    borderRadius: 4,
  },
  metaItem: { flex: 1 },
  metaLabel: {
    fontSize: 7,
    color: "#8A7E70",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
    fontFamily: "Helvetica",
  },
  metaValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#221C16" },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginTop: 20,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: "1px solid #E6DDCE",
    color: "#221C16",
  },
  row: { flexDirection: "row", marginBottom: 10 },
  rowLabel: {
    width: 130,
    color: "#8A7E70",
    fontSize: 9,
    fontFamily: "Helvetica",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  rowValue: { flex: 1, fontSize: 10, lineHeight: 1.5, color: "#221C16" },
  article: {
    backgroundColor: "#F2EBE0",
    padding: 11,
    marginBottom: 8,
    borderLeft: "3px solid #B87352",
  },
  articleCode: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 3,
    color: "#9A5A3D",
  },
  articleText: { fontSize: 9, color: "#5A4E42", lineHeight: 1.5 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 44,
    right: 44,
    fontSize: 7,
    color: "#8A7E70",
    textAlign: "center",
    borderTop: "1px solid #E6DDCE",
    paddingTop: 8,
    fontFamily: "Helvetica",
    letterSpacing: 0.6,
  },
});

export type EvidencePackProps = {
  systemName: string;
  vendor: string;
  riskLevel: string;
  owner: string;
  generatedAt: string;
  hash: string;
};

export function EvidencePack({
  systemName,
  vendor,
  riskLevel,
  owner,
  generatedAt,
  hash,
}: EvidencePackProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>nora.comply</Text>
            <Text style={styles.brandSub}>Audit-ready evidence pack</Text>
          </View>
          <Text style={{ fontSize: 8, color: "#8A7E70", fontFamily: "Helvetica" }}>
            EU AI Act · Article 11
          </Text>
        </View>

        <Text style={styles.title}>Technical Documentation</Text>
        <Text style={styles.subtitle}>
          Generated for {systemName} under EU AI Act Article 11.
        </Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>System</Text>
            <Text style={styles.metaValue}>{systemName}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Vendor / Model</Text>
            <Text style={styles.metaValue}>{vendor}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Risk classification</Text>
            <Text style={styles.metaValue}>{riskLevel}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Accountable owner</Text>
            <Text style={styles.metaValue}>{owner}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>1 · System overview</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Purpose</Text>
          <Text style={styles.rowValue}>
            Automated assistance for internal operations, with human review at decision points.
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Intended users</Text>
          <Text style={styles.rowValue}>Internal staff, trained reviewers.</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Deployment context</Text>
          <Text style={styles.rowValue}>
            EU customers only. Hosted in Vercel EU and Supabase EU (eu-west-1, Ireland).
          </Text>
        </View>

        <Text style={styles.sectionTitle}>2 · EU AI Act mapping</Text>

        <View style={styles.article}>
          <Text style={styles.articleCode}>Article 9 · Risk management</Text>
          <Text style={styles.articleText}>
            A documented risk register exists for this system, reviewed quarterly. Identified risks have mitigations and accountable owners.
          </Text>
        </View>
        <View style={styles.article}>
          <Text style={styles.articleCode}>Article 10 · Data governance</Text>
          <Text style={styles.articleText}>
            Training and evaluation data are documented with provenance, known limitations, and bias-testing results.
          </Text>
        </View>
        <View style={styles.article}>
          <Text style={styles.articleCode}>Article 13 · Transparency</Text>
          <Text style={styles.articleText}>
            End users are notified when interacting with the system. A plain-language disclosure is maintained and version-controlled.
          </Text>
        </View>
        <View style={styles.article}>
          <Text style={styles.articleCode}>Article 14 · Human oversight</Text>
          <Text style={styles.articleText}>
            A named human reviewer signs off material decisions. Override and escalation paths are logged immutably.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>3 · GDPR alignment</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Legal basis</Text>
          <Text style={styles.rowValue}>
            Legitimate interest, balanced against data-subject rights via DPIA.
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Data minimisation</Text>
          <Text style={styles.rowValue}>
            Only fields required for the documented purpose are processed.
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Retention</Text>
          <Text style={styles.rowValue}>
            Aligned to customer retention schedule, defaulting to 24 months.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>
            Generated by nora.comply on {generatedAt}  ·  SHA-256: {hash}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
