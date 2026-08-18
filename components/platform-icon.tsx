/** Uses the official brand marks (Simple Icons) rendered as white SVGs
 *  on top of the platform card's brand-colored circle. */

const SRC: Record<string, string> = {
  "Spotify": "/images/Platforms/spotify.svg",
  "Apple Podcasts": "/images/Platforms/applepodcasts.svg",
  "YouTube": "/images/Platforms/youtube.svg",
  "iHeart Radio": "/images/Platforms/iheartradio.svg",
  "Pocket Casts": "/images/Platforms/pocketcasts.svg",
  "Overcast": "/images/Platforms/overcast.svg",
};

export default function PlatformIcon({ name }: { name: string }) {
  const src = SRC[name];
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" aria-hidden="true" width={18} height={18} className="platform-glyph" />
  );
}
