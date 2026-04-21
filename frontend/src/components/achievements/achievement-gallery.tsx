import { useQuery } from "@tanstack/react-query";
import { AchievementBadge } from "./achievement-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Star, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AchievementGalleryProps {
  userId: string;
}

interface AchievementItem {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity?: string;
  points?: number;
  earned_at?: string | null;
  current_progress?: number;
  target_progress?: number;
  percent_complete?: number;
}

export function AchievementGallery({ userId }: AchievementGalleryProps) {
  const { data: achievements, isLoading } = useQuery<AchievementItem[]>({
    queryKey: [`/api/achievements/user/${userId}/progress`],
    enabled: !!userId,
  });

  if (isLoading) return <AchievementGallerySkeleton />;

  const all = achievements || [];
  const earned = all.filter(a => !!a.earned_at);

  const totalPoints = earned.reduce((sum, a) => sum + (a.points || 0), 0);
  const totalPossiblePoints = all.reduce((sum, a) => sum + (a.points || 0), 0);
  const completionPercentage = totalPossiblePoints > 0
    ? Math.round((totalPoints / totalPossiblePoints) * 100)
    : 0;

  const byCategory = {
    provider: all.filter(a => a.category === "provider"),
    customer: all.filter(a => a.category === "customer"),
    platform: all.filter(a => a.category === "platform"),
    special: all.filter(a => a.category === "special"),
  };
  const visibleCategories = Object.entries(byCategory).filter(([, items]) => items.length > 0);
  const tabCount = visibleCategories.length + 1; // +1 por "Todos"
  const gridColsClass = tabCount === 2 ? "grid-cols-2" : tabCount === 3 ? "grid-cols-3" : tabCount === 4 ? "grid-cols-4" : "grid-cols-5";

  const categoryIcons = {
    provider: <Target className="w-4 h-4" />,
    customer: <Trophy className="w-4 h-4" />,
    platform: <Star className="w-4 h-4" />,
    special: <Zap className="w-4 h-4" />,
  };

  const categoryNames = {
    provider: "Profesional",
    customer: "Cliente",
    platform: "Plataforma",
    special: "Especial",
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mx-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Puntos Totales</h3>
            <p className="text-3xl font-bold text-primary">{totalPoints}</p>
            <p className="text-sm text-muted-foreground">de {totalPossiblePoints} posibles</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Logros Obtenidos</h3>
            <p className="text-3xl font-bold text-primary">{earned.length}</p>
            <p className="text-sm text-muted-foreground">de {all.length} disponibles</p>
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

      <div className="px-6">
        <Tabs defaultValue="provider" className="w-full">
          <TabsList className={`grid ${gridColsClass} w-full`}>
            <TabsTrigger value="all">Todos</TabsTrigger>
            {visibleCategories.map(([key]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                {categoryIcons[key as keyof typeof categoryIcons]}
                <span className="hidden sm:inline">{categoryNames[key as keyof typeof categoryNames]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <AchievementGrid achievements={all} />
          </TabsContent>
          {visibleCategories.map(([cat, items]) => (
            <TabsContent key={cat} value={cat} className="mt-6">
              <AchievementGrid achievements={items} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function AchievementGrid({ achievements }: { achievements: AchievementItem[] }) {
  if (achievements.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay logros en esta categoría todavía.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {achievements.map((a) => (
        <div key={a.id} className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-50 transition-colors">
          <AchievementBadge
            achievement={{
              id: String(a.id),
              name: a.name,
              description: a.description,
              icon: a.icon,
              category: a.category,
              rarity: a.rarity as any,
              points: a.points,
              earnedAt: a.earned_at ? new Date(a.earned_at) : undefined,
              progress: a.current_progress,
              progressMax: a.target_progress,
            }}
            size="md"
          />
          <div className="text-center mt-2 w-full">
            <p className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{a.name}</p>
            {a.percent_complete !== undefined && !a.earned_at && (
              <p className="text-xs text-muted-foreground mt-1">{a.percent_complete}%</p>
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
        {[1,2,3,4,5,6,7,8].map((i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
