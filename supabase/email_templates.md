# Nora Comply — Supabase Email Templates

Paste each template into Supabase → Authentication → Email Templates.

---

## 1. Confirm signup

**Subject:** `Confirm your Nora Comply account`

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">
<div style="background:#0d1a30;border:1px solid #1e3358;border-radius:20px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#070e1c 0%,#0f2240 50%,#1a3a6b 100%);padding:32px 32px 24px;position:relative;overflow:hidden;">
    <div style="position:absolute;bottom:0;left:0;right:0;opacity:0.15;">
      <svg viewBox="0 0 600 80" preserveAspectRatio="none" style="display:block;width:100%;height:50px;">
        <polygon points="0,80 100,30 200,55 300,15 400,45 500,10 600,35 600,80" fill="#4a90d9"/>
      </svg>
    </div>
    <div style="position:relative;">
      <div style="font-size:22px;font-weight:700;color:#dceeff;">nora<span style="color:#4a90d9;">.</span>comply</div>
      <div style="font-family:monospace;font-size:10px;color:#5c85b8;text-transform:uppercase;letter-spacing:2px;margin-top:4px;">EU AI Act Compliance</div>
    </div>
  </div>
  <div style="padding:28px 32px;">
    <h2 style="font-size:24px;font-weight:700;color:#dceeff;margin:0 0 10px;line-height:1.2;">Confirm your email address</h2>
    <p style="color:#9bbce0;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Click the button below to verify your email and activate your Nora Comply workspace.
      This link expires in 24 hours.
    </p>
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#1a3a6b 0%,#2563b0 100%);color:#ffffff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:24px;">
      Confirm email address &rarr;
    </a>
    <p style="color:#5c85b8;font-size:12px;line-height:1.6;margin:0;">
      If you did not create a Nora Comply account, you can safely ignore this email.
    </p>
    <div style="font-family:monospace;font-size:10px;color:#2a4a72;border-top:1px solid #1e3358;padding-top:14px;margin-top:24px;line-height:1.7;">
      Nora Comply &middot; Built in Ireland &middot; Regulation (EU) 2024/1689
    </div>
  </div>
</div>
</div>
</body>
</html>
```

---

## 2. Invite user

**Subject:** `You've been invited to a Nora Comply workspace`

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">
<div style="background:#0d1a30;border:1px solid #1e3358;border-radius:20px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#070e1c 0%,#0f2240 50%,#1a3a6b 100%);padding:32px 32px 24px;position:relative;overflow:hidden;">
    <div style="position:absolute;bottom:0;left:0;right:0;opacity:0.15;">
      <svg viewBox="0 0 600 80" preserveAspectRatio="none" style="display:block;width:100%;height:50px;">
        <polygon points="0,80 100,30 200,55 300,15 400,45 500,10 600,35 600,80" fill="#4a90d9"/>
      </svg>
    </div>
    <div style="position:relative;">
      <div style="font-size:22px;font-weight:700;color:#dceeff;">nora<span style="color:#4a90d9;">.</span>comply</div>
      <div style="font-family:monospace;font-size:10px;color:#5c85b8;text-transform:uppercase;letter-spacing:2px;margin-top:4px;">EU AI Act Compliance</div>
    </div>
  </div>
  <div style="padding:28px 32px;">
    <h2 style="font-size:24px;font-weight:700;color:#dceeff;margin:0 0 10px;line-height:1.2;">You have been invited</h2>
    <p style="color:#9bbce0;font-size:14px;line-height:1.7;margin:0 0 16px;">
      You have been invited to join a <strong style="color:#dceeff;">Nora Comply</strong> workspace.
      Nora Comply helps organisations track EU AI Act compliance obligations and build audit-ready evidence records.
    </p>
    <div style="background:rgba(37,99,176,0.08);border:1px solid rgba(37,99,176,0.25);border-radius:12px;padding:14px 16px;margin-bottom:20px;">
      <div style="font-size:10px;font-weight:700;color:#4a90d9;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;font-family:monospace;">Your role</div>
      <div style="font-size:13px;color:#9bbce0;">You will have access to the compliance dashboard, evidence vault, and oversight logs for your organisation's AI systems.</div>
    </div>
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#1a3a6b 0%,#2563b0 100%);color:#ffffff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:24px;">
      Accept invitation &rarr;
    </a>
    <p style="color:#5c85b8;font-size:12px;line-height:1.6;margin:0;">
      This invitation link expires in 24 hours. If you were not expecting this invitation, you can safely ignore this email.
    </p>
    <div style="font-family:monospace;font-size:10px;color:#2a4a72;border-top:1px solid #1e3358;padding-top:14px;margin-top:24px;line-height:1.7;">
      Nora Comply &middot; Built in Ireland &middot; Regulation (EU) 2024/1689
    </div>
  </div>
</div>
</div>
</body>
</html>
```

---

## 3. Magic link / passwordless login

**Subject:** `Your Nora Comply sign-in link`

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">
<div style="background:#0d1a30;border:1px solid #1e3358;border-radius:20px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#070e1c 0%,#0f2240 50%,#1a3a6b 100%);padding:32px 32px 24px;position:relative;overflow:hidden;">
    <div style="position:absolute;bottom:0;left:0;right:0;opacity:0.15;">
      <svg viewBox="0 0 600 80" preserveAspectRatio="none" style="display:block;width:100%;height:50px;">
        <polygon points="0,80 100,30 200,55 300,15 400,45 500,10 600,35 600,80" fill="#4a90d9"/>
      </svg>
    </div>
    <div style="position:relative;">
      <div style="font-size:22px;font-weight:700;color:#dceeff;">nora<span style="color:#4a90d9;">.</span>comply</div>
      <div style="font-family:monospace;font-size:10px;color:#5c85b8;text-transform:uppercase;letter-spacing:2px;margin-top:4px;">EU AI Act Compliance</div>
    </div>
  </div>
  <div style="padding:28px 32px;">
    <h2 style="font-size:24px;font-weight:700;color:#dceeff;margin:0 0 10px;line-height:1.2;">Your sign-in link</h2>
    <p style="color:#9bbce0;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Click below to sign in to your Nora Comply workspace. This link expires in 1 hour and can only be used once.
    </p>
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#1a3a6b 0%,#2563b0 100%);color:#ffffff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:24px;">
      Sign in to Nora Comply &rarr;
    </a>
    <p style="color:#5c85b8;font-size:12px;line-height:1.6;margin:0;">
      If you did not request this link, you can safely ignore this email. Your account is secure.
    </p>
    <div style="font-family:monospace;font-size:10px;color:#2a4a72;border-top:1px solid #1e3358;padding-top:14px;margin-top:24px;line-height:1.7;">
      Nora Comply &middot; Built in Ireland &middot; Regulation (EU) 2024/1689
    </div>
  </div>
</div>
</div>
</body>
</html>
```

---

## How to apply these templates

1. Go to Supabase → Authentication → Email Templates
2. Select each template type from the dropdown
3. Paste the HTML above
4. Click Save
5. Done — all emails from Nora will use the glacier blue theme

