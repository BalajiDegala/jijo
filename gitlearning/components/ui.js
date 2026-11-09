"use client";
import { useState } from "react";
import { Check, Copy, ArrowRight } from "lucide-react";
import Link from "next/link";
export function CopyButton({ text, label = "Copy" }) {
  const [state, setState] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("Copied");
    } catch {
      setState("Select text to copy");
    }
    setTimeout(() => setState(""), 2200);
  }
  return (
    <button
      className="copy-button"
      onClick={copy}
      aria-label={`${label} command`}
    >
      {state === "Copied" ? <Check size={14} /> : <Copy size={14} />}
      <span aria-live="polite">{state || label}</span>
    </button>
  );
}
export function CodeBlock({ command }) {
  return (
    <div className="code-block">
      <code>{command}</code>
      <CopyButton text={command} />
    </div>
  );
}
export function SectionHeading({ eyebrow, title, description, children }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function ButtonLink({ href, children, secondary = false }) {
  return (
    <Link
      className={`button ${secondary ? "secondary" : "primary"}`}
      href={href}
    >
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}
export function Badge({ children, color = "purple" }) {
  return <span className={`badge ${color}`}>{children}</span>;
}
