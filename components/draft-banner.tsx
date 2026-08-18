/** Shown on the public site whenever Next.js draft mode is active. */
export default function DraftBanner() {
  return (
    <div className="draft-banner" role="status">
      <span>
        <strong>Preview mode is on</strong> — drafts are visible. Readers will not see them.
      </span>
      <a className="btn btn-primary btn-sm" href="/api/preview/disable">
        Exit preview
      </a>
    </div>
  );
}
