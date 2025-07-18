import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { type Achievement } from "@shared/schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AchievementBadgeProps {
  achievement: Achievement & { earnedAt?: Date; progress?: number; progressMax?: number };
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

const rarityColors = {
  common: "border-gray-400 bg-gray-50",
  uncommon: "border-green-500 bg-green-50",
  rare: "border-blue-500 bg-blue-50",
  epic: "border-purple-500 bg-purple-50",
  legendary: "border-yellow-500 bg-yellow-50 shadow-lg shadow-yellow-200",
};

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-20 h-20",
};

const iconSizes = {
  sm: 20,
  md: 24,
  lg: 32,
};

export function AchievementBadge({
  achievement,
  size = "md",
  showTooltip = true,
  className,
}: AchievementBadgeProps) {
  const Icon = Icons[achievement.icon as keyof typeof Icons] || Icons.Award;
  const isEarned = !!achievement.earnedAt;

  const badge = (
    <div
      className={cn(
        "relative rounded-full border-2 flex items-center justify-center transition-all overflow-hidden",
        sizeClasses[size],
        isEarned
          ? rarityColors[achievement.rarity || "common"]
          : "border-gray-300 bg-gray-100 opacity-50",
        className
      )}
    >
      <Icon 
        size={iconSizes[size]} 
        className={cn(
          "transition-colors",
          isEarned ? "text-white" : "text-gray-400"
        )}
      />
      {!isEarned && achievement.progress !== undefined && achievement.progressMax !== undefined && (
        <div className="absolute inset-0 rounded-full">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-300"
            />
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${(achievement.progress / achievement.progressMax) * 100}% 100%`}
              className="text-blue-500"
            />
          </svg>
        </div>
      )}
      {achievement.rarity === "legendary" && isEarned && (
        <div className="absolute inset-0 rounded-full animate-pulse bg-yellow-400 opacity-20" />
      )}
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">{achievement.name}</div>
            <div className="text-sm text-muted-foreground">
              {achievement.description}
            </div>
            {achievement.earnedAt && (
              <div className="text-xs text-muted-foreground">
                Obtenido el {new Date(achievement.earnedAt).toLocaleDateString('es-AR')}
              </div>
            )}
            {!isEarned && achievement.progress !== undefined && achievement.progressMax !== undefined && (
              <div className="text-xs text-muted-foreground">
                Progreso: {achievement.progress}/{achievement.progressMax}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium">+{achievement.points} puntos</span>
              <span className="capitalize text-muted-foreground">
                • {achievement.rarity}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}