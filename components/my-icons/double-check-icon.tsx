interface PlusIconProps {
  color?: string;
}

export default function DoubleCheckIcon(color: PlusIconProps) {
  const iconClassName = color.color ? `w-5 h-5 text-${color.color} icon icon-tabler icons-tabler-outline icon-tabler-checks` : "w-5 h-5 icon icon-tabler icons-tabler-outline icon-tabler-checks";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={iconClassName}
    >
     <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M7 12l5 5l10 -10" />
  <path d="M2 12l5 5m5 -5l5 -5" />
    </svg>
  );
}

{/* <svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  className="icon icon-tabler icons-tabler-outline icon-tabler-checks"
>
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M7 12l5 5l10 -10" />
  <path d="M2 12l5 5m5 -5l5 -5" />
</svg>; */}
