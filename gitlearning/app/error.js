"use client";
export default function ErrorPage({ reset }) {
  return (
    <div className="empty-state">
      <h1>Something didn’t load.</h1>
      <p>
        Your saved progress is still in this browser. Try opening the workspace
        again.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
