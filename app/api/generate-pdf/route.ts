import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createHash } from "crypto";
import { EvidencePack } from "@/lib/pdf/EvidencePack";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const systemName = body.systemName || "Customer Support Copilot";
    const vendor = body.vendor || "OpenAI · GPT-4o";
    const riskLevel = body.riskLevel || "Limited risk";
    const owner = body.owner || "Compliance team";
    const obligations = body.obligations || [];

    const generatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
    const hash = createHash("sha256")
      .update(`${systemName}-${vendor}-${generatedAt}`)
      .digest("hex")
      .slice(0, 16);

    const buffer = await renderToBuffer(
      EvidencePack({ systemName, vendor, riskLevel, owner, generatedAt, obligations })
    );

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="evidence-${hash}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
