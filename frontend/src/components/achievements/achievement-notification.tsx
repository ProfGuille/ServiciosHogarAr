import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Achievement } from "@shared/schema";
import { AchievementBadge } from "./achievement-badge";
import { X } from "lucide-react";
import confetti from "canvas-confetti";

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementNotification({
  achievement,
  onClose,
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      
      // Trigger confetti for rare achievements or higher
      if (achievement.rarity === "rare" || 
          achievement.rarity === "epic" || 
          achievement.rarity === "legendary") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: achievement.rarity === "legendary" 
            ? ["#FFD700", "#FFA500", "#FF6347"] 
            : ["#3B82F6", "#8B5CF6", "#EC4899"],
        });
      }

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 min-w-[320px] border border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
              >
                <AchievementBadge achievement={achievement} size="lg" showTooltip={false} />
              </motion.div>
              
              <div className="flex-1">
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-bold text-gray-900 dark:text-white"
                >
                  ¡Logro Desbloqueado!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-1"
                >
                  {achievement.name}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-gray-600 dark:text-gray-400 mt-1"
                >
                  {achievement.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-3 mt-2 text-sm"
                >
                  <span className="font-semibold text-primary">
                    +{achievement.points} puntos
                  </span>
                  <span className="capitalize text-muted-foreground">
                    {achievement.rarity}
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}