interface PlusIconProps {
  color?: string;
}

export default function CheckCircleIcon(color: PlusIconProps) {
  const iconClassName = color.color ? `w-5 h-5 text-${color.color}` : "w-5 h-5";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={iconClassName}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
