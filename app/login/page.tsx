"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Logo } from "@/components/landing/Logo";
import { signIn, signUp } from "./actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full justify-center disabled:opacity-60"
    >
      {pending ? "Just a moment..." : label}
    </button>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction] = useFormState(signIn, undefined);
  const [signUpState, signUpAction] = useFormState(signUp, undefined);

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full blur-3xl"
        style={{ background: "rgba(184,115,82,0.10)" }}
      />
      <div
        aria-hidden
        className="absolute top-40 -right-40 w-[420px] h-[420px] rounded-full blur-3xl"
        style={{ background: "rgba(127,139,111,0.12)" }}
      />

      <nav className="relative z-10 px-6 lg:px-10 pt-6">
        <div className="max-w-7xl mx-auto">
          <Logo />
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 relative z-10 py-12">
        <div className="w-full max-w-md card p-9">
          <span className="eyebrow">{mode === "signin" ? "Welcome back" : "New workspace"}</span>
          <h1
            className="display-serif text-ink mt-3 mb-2 leading-tight"
            style={{ fontSize: "2rem", fontWeight: 400 }}
          >
            {mode === "signin" ? (
              <>Sign in, <span className="italic font-light text-bronze-deep">quietly</span>.</>
            ) : (
              <>Begin your <span className="italic font-light text-bronze-deep">workspace</span>.</>
            )}
          </h1>
          <p className="text-sm text-ink2 mb-7 font-light">
            {mode === "signin"
              ? "Pick up where your evidence trail left off."
              : "Three minutes to your first AI system registry."}
          </p>

          {mode === "signin" ? (
            <form action={signInAction} className="space-y-4">
              <Field label="Work email" name="email" type="email" placeholder="you@company.com" />
              <Field label="Password" name="password" type="password" placeholder="At least 8 characters" />
              {signInState?.error && <ErrorBanner message={signInState.error} />}
              <SubmitButton label="Sign in" />
            </form>
          ) : (
            <form action={signUpAction} className="space-y-4">
              <Field label="Company name" name="companyName" type="text" placeholder="Acme Ltd" />
              <Field label="Work email" name="email" type="email" placeholder="you@company.com" />
              <Field label="Password" name="password" type="password" placeholder="At least 8 characters" />
              {signUpState?.error && <ErrorBanner message={signUpState.error} />}
              {signUpState?.info && <InfoBanner message={signUpState.info} />}
              <SubmitButton label="Create workspace" />
            </form>
          )}

          <div className="mt-7 pt-6 border-t border-line text-center text-xs text-ink2">
            {mode === "signin" ? (
              <>
                No account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-bronze-deep font-medium hover:underline"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Have an account?{" "}
                <button
                  onClick={() => setMode("signin")}
                  className="text-bronze-deep font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>

          <div className="mt-3 text-center text-[11px] text-muted">
            Or{" "}
            <Link href="/dashboard?demo=1" className="underline hover:text-ink transition">
              view the demo dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required
        className="w-full bg-bone/60 border border-line rounded-xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-bronze focus:bg-paper transition"
      />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="text-xs px-3 py-2.5 rounded-xl leading-relaxed"
      style={{
        background: "rgba(181,96,78,0.08)",
        border: "1px solid rgba(181,96,78,0.25)",
        color: "var(--danger)",
      }}
    >
      {message}
    </div>
  );
}

function InfoBanner({ message }: { message: string }) {
  return (
    <div
      className="text-xs px-3 py-2.5 rounded-xl leading-relaxed"
      style={{
        background: "rgba(127,139,111,0.10)",
        border: "1px solid rgba(127,139,111,0.30)",
        color: "var(--sage)",
      }}
    >
      {message}
    </div>
  );
}
