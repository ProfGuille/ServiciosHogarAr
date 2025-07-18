import { useQuery } from "@tanstack/react-query";
import { type Achievement } from "@shared/schema";
import { AchievementBadge } from "./achievement-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Star, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AchievementGalleryProps {
  userId: string;
}

interface AchievementWithProgress extends Achievement {
  earnedAt?: Date;
  currentProgress?: number;
  targetProgress?: number;
  percentComplete?: number;
}

export function AchievementGallery({ userId }: AchievementGalleryProps) {
  // Fetch earned achievements
  const { data: earnedAchievements, isLoading: loadingEarned } = useQuery<Achievement[]>({
    queryKey: [`/api/achievements/user/${userId}`],
    enabled: !!userId,
  });

  // Fetch achievement progress
  const { data: progressAchievements, isLoading: loadingProgress } = useQuery<AchievementWithProgress[]>({
    queryKey: [`/api/achievements/user/${userId}/progress`],
    enabled: !!userId,
  });

  if (loadingEarned || loadingProgress) {
    return <AchievementGallerySkeleton />;
  }

  const allAchievements = [
    ...(earnedAchievements || []),
    ...(progressAchievements || []),
  ];

  const achievementsByCategory = {
    customer: allAchievements.filter(a => a.category === "customer"),
    provider: allAchievements.filter(a => a.category === "provider"),
    platform: allAchievements.filter(a => a.category === "platform"),
    special: allAchievements.filter(a => a.category === "special"),
  };

  const totalPoints = earnedAchievements?.reduce((sum, a) => sum + (a.points || 0), 0) || 0;
  const totalPossiblePoints = allAchievements.reduce((sum, a) => sum + (a.points || 0), 0);
  const completionPercentage = totalPossiblePoints > 0 
    ? Math.round((totalPoints / totalPossiblePoints) * 100) 
    : 0;

  const categoryIcons = {
    customer: <Trophy className="w-4 h-4" />,
    provider: <Target className="w-4 h-4" />,
    platform: <Star className="w-4 h-4" />,
    special: <Zap className="w-4 h-4" />,
  };

  const categoryNames = {
    customer: "Cliente",
    provider: "Profesional",
    platform: "Plataforma",
    special: "Especial",
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Puntos Totales</h3>
            <p className="text-3xl font-bold text-primary">{totalPoints}</p>
            <p className="text-sm text-muted-foreground">
              de {totalPossiblePoints} posibles
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Logros Obtenidos</h3>
            <p className="text-3xl font-bold text-primary">
              {earnedAchievements?.length || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              de {allAchievements.length} disponibles
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Progreso Total</h3>
            <div className="space-y-2">
              <Progress value={completionPercentage} className="h-3" />
              <p className="text-sm font-medium">{completionPercentage}% completado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">Todos</TabsTrigger>
          {Object.entries(categoryNames).map(([key, name]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-1">
              {categoryIcons[key as keyof typeof categoryIcons]}
              <span className="hidden sm:inline">{name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <AchievementGrid achievements={allAchievements} />
        </TabsContent>

        {Object.entries(achievementsByCategory).map(([category, achievements]) => (
          <TabsContent key={category} value={category} className="mt-6">
            <AchievementGrid achievements={achievements} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function AchievementGrid({ achievements }: { achievements: AchievementWithProgress[] }) {
  if (achievements.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay logros en esta categoría todavía.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {achievements.map((achievement) => (
        <div key={achievement.id} className="flex flex-col items-center space-y-2">
          <AchievementBadge
            achievement={{
              ...achievement,
              progress: achievement.currentProgress,
              progressMax: achievement.targetProgress,
            }}
            size="md"
          />
          <div className="text-center">
            <p className="text-sm font-medium line-clamp-2">{achievement.name}</p>
            {achievement.percentComplete !== undefined && !achievement.earnedAt && (
              <p className="text-xs text-muted-foreground">
                {achievement.percentComplete}%
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AchievementGallerySkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-40 mt-1" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}