interface PlusIconProps {
  color?: string;
}

export default function CircleIcon(color: PlusIconProps) {
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
      <circle  cx="12" cy="12" r="10" />
    </svg>
  );
}
