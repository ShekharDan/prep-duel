const ICONS = {
  database: (
    <path d="M12 4c-4 0-8 1.5-8 3.5S8 11 12 11s8-1.5 8-3.5S16 4 12 4zm0 5.5c-3.2 0-6-.9-6-2s2.8-2 6-2 6 .9 6 2-2.8 2-6 2zm-8 3C4 14.5 8 16 12 16s8-1.5 8-3.5V13c-2.2 1.1-5.2 1.5-8 1.5S6.2 14.1 4 13v-.5zm0 3C4 17.5 8 19 12 19s8-1.5 8-3.5V17c-2.2 1.1-5.2 1.5-8 1.5S6.2 18.1 4 17v-.5z" />
  ),
  cpu: (
    <path d="M9 3V2h2v1h2V2h2v1h1v2h1v2h-1v2h1v2h-1v2h-1v1h-2v1h-2v-1H9v1H7v-1H6v-1H5v-2H4v-2h1v-2H4V7h1V5h1V3h2zm1 4h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
  ),
  network: (
    <path d="M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM5 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM8.5 12.5l2.8-1.5M14.7 12.5l-2.8-1.5M7.2 16.2l3.1 1.3M16.8 16.2l-3.1 1.3" />
  ),
  algo: (
    <path d="M7 6l-3 3 3 3M17 6l3 3-3 3M14 5l-4 14" />
  ),
  code: (
    <path d="M8 7l-4 5 4 5M16 7l4 5-4 5M13 6l-2 12" />
  ),
  percent: (
    <path d="M7 7.5A2.5 2.5 0 1 1 7 12.5 2.5 2.5 0 0 1 7 7.5zm10 4A2.5 2.5 0 1 1 17 16.5 2.5 2.5 0 0 1 17 11.5zM8 16l8-8" />
  ),
  clock: (
    <path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 3v5l4 2" />
  ),
  logic: (
    <path d="M6 8h4v2H8v6H6V8zm10 0h-4v2h2v6h2V8zM10 11h4v2h-4v-2z" />
  ),
  puzzle: (
    <path d="M8 4h3v3H8V4zm5 0h3v3h-3V4zM4 9h3v3H4V9zm13 0h3v3h-3V9zM8 14h3v3H8v-3zm5 0h3v3h-3v-3z" />
  ),
  book: (
    <path d="M6 4h5a2 2 0 0 1 2 2v12H8a2 2 0 0 0-2 2V4zm8 2h2a1 1 0 0 1 1 1v11h-3V6z" />
  ),
  globe: (
    <path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-6 8a6 6 0 0 1 6-6v12a6 6 0 0 1-6-6zm6-6a6 6 0 0 1 6 6 6 6 0 0 1-6 6V6z" />
  ),
  array: (
    <path d="M5 6h3v12H5V6zm5 0h3v8h-3V6zm5 0h3v10h-3V6z" />
  ),
  hash: (
    <path d="M8 6l2 12M14 6l-2 12M6 10h12M6 14h12" />
  ),
  tree: (
    <path d="M12 4v4M8 10h8M10 10v3M14 10v3M9 17h6" />
  ),
  graph: (
    <path d="M5 16l4-8 3 5 3-3 4 6M5 16h14" />
  ),
  java: (
    <path d="M8 6c0 3-4 3.5-4 5.5C4 14 8 15 10 15c3 0 6-1 6-4 0-2-3-2.5-4-3.5S8 9 8 6zm4 10c2 1 4 1 4 2.5S13 20 10 20s-6-1-6-3c0-1.5 2-1.5 4-2.5z" />
  ),
  layers: (
    <path d="M12 4L4 8l8 4 8-4-8-4zm-8 6l8 4 8-4M4 14l8 4 8-4" />
  ),
  spring: (
    <path d="M12 3v3M12 18v3M6 6l2 2M16 16l2 2M4 12h3M17 12h3M6 18l2-2M16 8l2-2" />
  ),
  ticket: (
    <path d="M6 6h12a1 1 0 0 1 1 1v2.2a2 2 0 0 0 0 3.6V15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2.2a2 2 0 0 0 0-3.6V7a1 1 0 0 1 1-1zm6 3v6" />
  ),
  docker: (
    <path d="M5 11h2v2H5v-2zm3 0h2v2H8v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zM4 13h14l-1 3H5l-1-3z" />
  ),
  briefcase: (
    <path d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1h2v11H6V7h2zm2-1h4V6h-4v1z" />
  ),
};

export default function TopicIcon({ iconKey = "book", className = "" }) {
  const path = ICONS[iconKey] || ICONS.book;
  return (
    <svg
      className={`topic-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
