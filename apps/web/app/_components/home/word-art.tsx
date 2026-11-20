import type { ReactElement } from "react";

/**
 * Flat illustrations for the homepage sample words, drawn on a 64x64 grid so they sit in the
 * sticker's white disc at any size.
 */
const ART: Record<string, ReactElement> = {
  apple: (
    <>
      <path
        d="M32 21c-4-4-14-5-18 3s-2 22 6 28c4 3 8 2 12 0 4 2 8 3 12 0 8-6 10-20 6-28s-14-7-18-3z"
        fill="#FF4B4B"
      />
      <path d="M32 22c0-5 1-9 4-12" stroke="#7C4A2D" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 14c4-5 10-5 13-3-2 5-8 7-13 3z" fill="#22C55E" />
      <ellipse cx="22" cy="31" rx="3" ry="5" fill="#fff" opacity=".5" />
    </>
  ),
  banana: (
    <>
      <path
        d="M16 16c-2 18 12 32 34 28 2-.5 2-4-1-4-15 0-25-10-27-24-.5-3-5.5-3-6 0z"
        fill="#FFC800"
      />
      <path d="M17 24c3 10 11 17 24 19" stroke="#E0A800" strokeWidth="2" strokeLinecap="round" />
      <path d="M17.5 15.5 16 11" stroke="#7C4A2D" strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  fish: (
    <>
      <path d="M18 32 6 21v22z" fill="#0E8FD0" />
      <path d="M48 32c-6-10-20-13-31 0 11 13 25 10 31 0z" fill="#1CB0F6" />
      <path d="M27 23c3-5 9-6 13-3" stroke="#0E8FD0" strokeWidth="3" strokeLinecap="round" />
      <circle cx="39" cy="29.5" r="3" fill="#fff" />
      <circle cx="39.5" cy="29.5" r="1.6" fill="#3D465D" />
    </>
  ),
  cat: (
    <>
      <path d="M16 27 17 8l13 10zM48 27 47 8 34 18z" fill="#FF9600" />
      <path d="M19.5 22 20 13l6 5zM44.5 22 44 13l-6 5z" fill="#FFC2D1" />
      <circle cx="32" cy="35" r="17" fill="#FF9600" />
      <circle cx="25" cy="33" r="2.6" fill="#3D465D" />
      <circle cx="39" cy="33" r="2.6" fill="#3D465D" />
      <path d="M29.5 39h5L32 42z" fill="#FF4B4B" />
      <path
        d="M12 38h10M12.5 43l9.5-2M52 38H42M51.5 43l-9.5-2"
        stroke="#3D465D"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>
  ),
  sun: (
    <>
      <path
        d="M49 32h7M44 44l5 5M32 49v7M20 44l-5 5M15 32H8M20 20l-5-5M32 15V8M44 20l5-5"
        stroke="#FF9600"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="12" fill="#FFC800" />
    </>
  ),
  ball: (
    <>
      <circle cx="32" cy="32" r="20" fill="#fff" />
      <path d="M32 12a20 20 0 0 0 0 40c-9-7-11-31 0-40z" fill="#FF4B4B" />
      <path d="M32 12a20 20 0 0 1 0 40c9-7 11-31 0-40z" fill="#1CB0F6" />
      <path d="M32 12c-5 8-5 32 0 40 5-8 5-32 0-40z" fill="#FFC800" />
      <circle cx="32" cy="32" r="20" stroke="#3D465D" strokeOpacity=".25" strokeWidth="2" />
      <ellipse
        cx="23"
        cy="22"
        rx="4"
        ry="2.5"
        fill="#fff"
        opacity=".6"
        transform="rotate(-35 23 22)"
      />
    </>
  ),
  book: (
    <>
      <path d="M8 18c8-3 16-2 24 3v28c-8-5-16-6-24-3z" fill="#1CB0F6" />
      <path d="M56 18c-8-3-16-2-24 3v28c8-5 16-6 24-3z" fill="#22C55E" />
      <path
        d="M14 27c5-1 9 0 13 2M14 33c5-1 9 0 13 2M37 29c4-2 8-3 13-2M37 35c4-2 8-3 13-2"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </>
  ),
  pencil: (
    <g transform="rotate(-45 32 32)">
      <rect x="8" y="27" width="6" height="10" rx="2" fill="#F472B6" />
      <rect x="14" y="27" width="4" height="10" fill="#94A3B8" />
      <rect x="18" y="27" width="26" height="10" fill="#FFC800" />
      <path d="M18 32h26" stroke="#E0A800" strokeWidth="1.5" />
      <path d="m44 27 11 5-11 5z" fill="#F5D7A1" />
      <path d="m51.5 30.4 3.5 1.6-3.5 1.6z" fill="#3D465D" />
    </g>
  ),
};

interface WordArtProps {
  readonly word: string;
  readonly className?: string;
}

export function WordArt({ word, className }: WordArtProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      {ART[word]}
    </svg>
  );
}
