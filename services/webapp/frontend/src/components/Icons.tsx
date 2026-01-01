import React from "react";

type Props = React.SVGProps<SVGSVGElement>;

export function IconGrid(p: Props) {
  return (
      <svg viewBox="0 0 24 24" fill="none" {...p}>
        <path
            d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
        />
      </svg>
  );
}

export function IconWand(p: Props) {
  return (
      <svg viewBox="0 0 24 24" fill="none" {...p}>
        <path
            d="M4 20 14 10m2-2 4-4M6 6l2 2M6 10l2-2m8 8 2 2m-2-6 2-2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
        <path d="M14 10 4 20" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
  );
}

export function IconLink(p: Props) {
  return (
      <svg viewBox="0 0 24 24" fill="none" {...p}>
        <path
            d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
        <path
            d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
      </svg>
  );
}

export function IconFolder(p: Props) {
  return (
      <svg viewBox="0 0 24 24" fill="none" {...p}>
        <path
            d="M3.5 6.8c0-1.1.9-2 2-2h4l2 2h7c1.1 0 2 .9 2 2v8.4c0 1.1-.9 2-2 2h-13c-1.1 0-2-.9-2-2V6.8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
      </svg>
  );
}

export function IconSpark(p: Props) {
  return (
      <svg viewBox="0 0 24 24" fill="none" {...p}>
        <path
            d="M12 2l1.2 5.1L18 9l-4.8 1.9L12 16l-1.2-5.1L6 9l4.8-1.9L12 2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        <path
            d="M5 14l.7 2.8L8.5 18l-2.8 1.2L5 22l-.7-2.8L1.5 18l2.8-1.2L5 14Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
        />
      </svg>
  );
}

export function IconTag(p: Props) {
  return (
      <svg viewBox="0 0 24 24" fill="none" {...p}>
        <path
            d="M3 12V4h8l10 10-8 8L3 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
      </svg>
  );
}

export function IconLogout(p: Props) {
  return (
      <svg viewBox="0 0 24 24" fill="none" {...p}>
        <path
            d="M10 7V6a2 2 0 0 1 2-2h7v16h-7a2 2 0 0 1-2-2v-1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        <path
            d="M4 12h10m0 0-3-3m3 3-3 3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
      </svg>
  );
}
