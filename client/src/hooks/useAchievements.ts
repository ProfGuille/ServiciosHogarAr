import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Achievement } from "@shared/schema";
import { useAuth } from "./useAuth";

export function useAchievements() {
  const { user } = useAuth();
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  // Fetch unnotified achievements
  const { data: unnotifiedAchievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements/unnotified"],
    enabled: !!user,
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Mark achievements as notified
  const markNotifiedMutation = useMutation({
    mutationFn: async (achievementIds: number[]) => {
      await apiRequest("POST", "/api/achievements/mark-notified", { achievementIds });
    },
  });

  // Check for new achievements
  const checkAchievementsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/achievements/check");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.newAchievements?.length > 0) {
        // Invalidate achievement queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      }
    },
  });

  // Show unnotified achievements one by one
  useEffect(() => {
    if (unnotifiedAchievements && unnotifiedAchievements.length > 0 && !currentAchievement) {
      const [firstAchievement, ...rest] = unnotifiedAchievements;
      setCurrentAchievement(firstAchievement);
      
      // Mark as notified
      markNotifiedMutation.mutate([firstAchievement.id]);
    }
  }, [unnotifiedAchievements, currentAchievement]);

  const closeNotification = () => {
    setCurrentAchievement(null);
  };

  const checkAchievements = () => {
    if (user) {
      checkAchievementsMutation.mutate();
    }
  };

  return {
    currentAchievement,
    closeNotification,
    checkAchievements,
  };
}