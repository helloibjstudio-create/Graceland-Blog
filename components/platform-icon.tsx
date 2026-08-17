/** Simplified glyphs for the podcast platform cards. */
export default function PlatformIcon({ name }: { name: string }) {
  switch (name) {
    case "Spotify":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6.5 9c4-1 8-.6 11 1M7.5 12.5c3.2-.8 6.4-.4 8.9 1.1M8.5 16c2.5-.6 5-.3 7 .9"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "Apple Podcasts":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3a4 4 0 0 1 4 4v4a4 4 0 0 1-8 0V7a4 4 0 0 1 4-4Zm-6 8a6 6 0 0 0 12 0M12 17v4"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "YouTube":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
          <path d="M8 6v12l10-6z" />
        </svg>
      );
    case "iHeart Radio":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 20s7-5.5 7-10a7 7 0 1 0-14 0c0 4.5 7 10 7 10Z" stroke="#fff" strokeWidth="2" />
        </svg>
      );
    case "Pocket Casts":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2" />
          <path d="M12 7v5l3 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3" fill="#fff" />
          <path d="M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}
