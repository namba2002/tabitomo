import { Season } from "@/types";

const SEASON_CONFIG: Record<Season, { label: string; className: string }> = {
  spring: { label: "春", className: "bg-pink-100 text-pink-600" },
  summer: { label: "夏", className: "bg-yellow-100 text-yellow-600" },
  autumn: { label: "秋", className: "bg-orange-100 text-orange-600" },
  winter: { label: "冬", className: "bg-sky-100 text-sky-600" },
  undecided: { label: "その他", className: "bg-gray-100 text-gray-500" },
};

interface SeasonBadgeProps {
  season: Season;
}

export function SeasonBadge({ season }: SeasonBadgeProps) {
  const { label, className } = SEASON_CONFIG[season];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

export { SEASON_CONFIG };
