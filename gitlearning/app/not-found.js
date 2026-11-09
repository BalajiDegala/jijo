import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <code>404 / unknown revision</code>
      <h1>This branch leads nowhere.</h1>
      <p>Let’s get you back to a familiar commit.</p>
      <Link className="button primary" href="/">
        Back to your workspace →
      </Link>
    </div>
  );
}
