import { useQuery } from "@tanstack/react-query";
import { type Achievement } from "@shared/schema";
import { AchievementBadge } from "@/components/achievements/achievement-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface BadgeShowcaseProps {
  userId: string;
  limit?: number;
  className?: string;
}

export function BadgeShowcase({ userId, limit = 5, className }: BadgeShowcaseProps) {
  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: [`/api/achievements/user/${userId}`],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-12 h-12 bg-gray-200 rounded-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!achievements || achievements.length === 0) {
    return null;
  }

  // Get the most recent or highest rarity achievements
  const showcaseAchievements = achievements
    .sort((a, b) => {
      // Sort by rarity first, then by earned date
      const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
      const rarityDiff = (rarityOrder[b.rarity || 'common'] || 0) - (rarityOrder[a.rarity || 'common'] || 0);
      if (rarityDiff !== 0) return rarityDiff;
      
      // Then by earned date (assuming achievements have earnedAt)
      return new Date(b.earnedAt || 0).getTime() - new Date(a.earnedAt || 0).getTime();
    })
    .slice(0, limit);

  const totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), 0);

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Logros</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {totalPoints} puntos
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {showcaseAchievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              size="sm"
            />
          ))}
          {achievements.length > limit && (
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">
                +{achievements.length - limit}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}