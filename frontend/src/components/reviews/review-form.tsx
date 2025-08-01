import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Star } from "lucide-react";

const reviewFormSchema = z.object({
  rating: z.number().min(1, "Selecciona una calificación").max(5),
  comment: z.string().min(10, "El comentario debe tener al menos 10 caracteres"),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  providerId: number;
  serviceRequestId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewForm({ providerId, serviceRequestId, isOpen, onClose }: ReviewFormProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      return await apiRequest("POST", "/api/reviews", {
        ...data,
        providerId,
        serviceRequestId,
      });
    },
    onSuccess: (data) => {
      toast({
        title: data.message ? "Reseña actualizada" : "Reseña enviada",
        description: data.message || "Tu reseña ha sido publicada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}`] });
      onClose();
      form.reset();
      setSelectedRating(0);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Autorización requerida",
          description: "Debes iniciar sesión para escribir reseñas.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 2000);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la reseña",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    if (!isAuthenticated) {
      toast({
        title: "Autorización requerida",
        description: "Debes iniciar sesión para escribir reseñas.",
        variant: "destructive",
      });
      return;
    }
    reviewMutation.mutate(data);
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    form.setValue("rating", rating);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Calificar servicio</DialogTitle>
          <DialogDescription>
            Comparte tu experiencia con este profesional. Si ya has calificado este servicio, tu calificación será actualizada.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Star Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calificación</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="p-1 transition-colors"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleStarClick(star)}
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= (hoverRating || selectedRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {selectedRating > 0 && (
                          <>
                            {selectedRating} de 5 estrella{selectedRating !== 1 ? 's' : ''}
                          </>
                        )}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentario</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe tu experiencia con este profesional..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={reviewMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={reviewMutation.isPending || selectedRating === 0}
              >
                {reviewMutation.isPending ? "Enviando..." : "Enviar reseña"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}