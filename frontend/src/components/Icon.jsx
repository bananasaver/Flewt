// Small, dependency-free icon set. Add more names here as new categories arrive.
const paths = {
  pdf: 'M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM14 2v6h6M8 13h8M8 17h5',
  document: 'M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM9 15l2 2 4-5',
  mic: 'M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v4M8 22h8',
  image: 'M4 4h16v16H4zM4 16l5-5 4 4 3-3 4 4M9 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z',
  bolt: 'M13 2 3 14h7l-1 8 10-12h-7l1-8z',
  sign: 'M3 20c3-4 6 2 9-2s3-6 6-2M17 6l3 3-9 9-3.5.5.5-3.5z',
  receipt: 'M5 2h14v20l-2.5-1.5L14 22l-2.5-1.5L9 22l-2.5-1.5L4 22V2h1zM8 8h8M8 12h8M8 16h5',
};

export default function Icon({ name, size = 28, className = '' }) {
  const d = paths[name] || paths.bolt;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
