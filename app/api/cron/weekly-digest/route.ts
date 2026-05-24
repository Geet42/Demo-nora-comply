import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (process.env.CRON_SECRET && auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !from) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const sent: string[] = [];
  const failed: { email: string; error: string }[] = [];

  if (supabaseUrl && serviceKey) {
    const admin = createAdminClient();

    const { data: owners } = await admin
      .from("memberships")
      .select("user_id, company_id, role, companies(name)")
      .eq("role", "owner");

    if (owners) {
      for (const row of owners as any[]) {
        const { data: userRes } = await (admin as any).auth.admin.getUserById(row.user_id);
        const email = userRes?.user?.email;
        if (!email) continue;

        const { count: systemCount } = await admin
          .from("ai_systems")
          .select("*", { count: "exact", head: true })
          .eq("company_id", row.company_id);

        const { error } = await resend.emails.send({
          from,
          to: email,
          subject: "Your weekly Nora Comply digest",
          html: digestHtml({
            companyName: row.companies?.name || "your workspace",
            systemCount: systemCount ?? 0,
          }),
        });

        if (error) failed.push({ email, error: error.message });
        else sent.push(email);
      }
    }
  } else {
    const testTo = process.env.DIGEST_TEST_RECIPIENT || from;
    const { error } = await resend.emails.send({
      from,
      to: testTo,
      subject: "Your weekly Nora Comply digest",
      html: digestHtml({ companyName: "your workspace", systemCount: 5 }),
    });
    if (error) failed.push({ email: testTo, error: error.message });
    else sent.push(testTo);
  }

  return NextResponse.json({ ok: true, sent: sent.length, failed });
}

function digestHtml({
  companyName,
  systemCount,
}: {
  companyName: string;
  systemCount: number;
}) {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #FBF6EF; color: #221C16; border-radius: 20px; border: 1px solid #E6DDCE;">
      <div style="border-bottom: 1px solid #E6DDCE; padding-bottom: 18px; margin-bottom: 24px;">
        <div style="font-size: 20px; font-weight: 500; color: #221C16;">nora<span style="color: #9A5A3D;">.</span>comply</div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8A7E70; text-transform: uppercase; letter-spacing: 1.4px; margin-top: 6px;">Weekly digest &middot; ${companyName}</div>
      </div>
      <h2 style="font-size: 26px; margin: 0 0 14px; font-weight: 400; line-height: 1.2;">
        ${systemCount} AI ${systemCount === 1 ? "system" : "systems"} tracked this week.
      </h2>
      <p style="color: #5A4E42; line-height: 1.7; font-size: 15px;">Your compliance posture moved <strong style="color: #9A5A3D;">+4%</strong> this week. Open the dashboard to review action items.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://noracomply.com"}/dashboard" style="display: inline-block; background: #221C16; color: #FBF6EF; padding: 14px 26px; border-radius: 999px; text-decoration: none; font-weight: 500; margin-top: 18px; font-family: system-ui, sans-serif; font-size: 14px;">Open dashboard &rarr;</a>
      <div style="margin-top: 36px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8A7E70;">Sent by Nora Comply &middot; Built in Ireland</div>
    </div>
  `;
}
