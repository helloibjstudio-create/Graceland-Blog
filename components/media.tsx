"use client";

import { useEffect, useRef, useState } from "react";

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  src?: string;
  alt?: string;
  /** Shown before the image loads, and kept if the asset is missing. */
  gradient?: string;
};

/**
 * Image with a graceful placeholder. Drop the real files into /public/images
 * and they appear automatically; until then the gradient stands in.
 */
export default function Media({ src, alt = "", className = "", gradient, style, ...rest }: Props) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The 404 usually lands before hydration, so onError never reaches React —
  // check the element's own state once on mount too.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  return (
    <span
      className={`ph ${className}`.trim()}
      style={{ ...(gradient ? { background: gradient } : null), ...style }}
      {...rest}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={imgRef} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      ) : null}
    </span>
  );
}
