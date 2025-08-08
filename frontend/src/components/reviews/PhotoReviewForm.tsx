import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { apiRequest } from "@/lib/queryClient";
import { 
  Star, 
  Camera, 
  X, 
  Upload, 
  Loader2,
  MessageCircle,
  Clock,
  DollarSign,
  ThumbsUp
} from "lucide-react";

const photoReviewSchema = z.object({
  rating: z.number().min(1, "Selecciona una calificación").max(5),
  comment: z.string().min(10, "El comentario debe tener al menos 10 caracteres"),
  workQuality: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  punctuality: z.number().min(1).max(5),
  value: z.number().min(1).max(5),
  tags: z.array(z.string()).optional(),
});

type PhotoReviewFormData = z.infer<typeof photoReviewSchema>;

interface PhotoReviewFormProps {
  providerId: number;
  serviceRequestId: number;
  isOpen: boolean;
  onClose: () => void;
}

const QUALITY_TAGS = [
  "Trabajo excelente",
  "Muy profesional", 
  "Puntual",
  "Limpio y ordenado",
  "Precio justo",
  "Comunicación clara",
  "Solucionó el problema",
  "Volvería a contratar",
  "Lo recomiendo",
  "Rápido",
  "Confiable",
  "Educado"
];

export function PhotoReviewForm({ providerId, serviceRequestId, isOpen, onClose }: PhotoReviewFormProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { trackReviewCreated } = useAnalytics();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Sub-ratings
  const [workQuality, setWorkQuality] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [value, setValue] = useState(0);

  const form = useForm<PhotoReviewFormData>({
    resolver: zodResolver(photoReviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
      workQuality: 0,
      communication: 0,
      punctuality: 0,
      value: 0,
      tags: [],
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: PhotoReviewFormData & { photos: string[] }) => {
      const response = await apiRequest('POST', '/api/reviews', {
        ...data,
        providerId,
        serviceRequestId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reseña enviada",
        description: "Tu reseña ha sido publicada exitosamente.",
      });
      trackReviewCreated(serviceRequestId, selectedRating);
      queryClient.invalidateQueries({ queryKey: ['provider', providerId] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la reseña.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    form.reset();
    setSelectedRating(0);
    setHoverRating(0);
    setSelectedPhotos([]);
    setSelectedTags([]);
    setWorkQuality(0);
    setCommunication(0);
    setPunctuality(0);
    setValue(0);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Archivos inválidos",
        description: "Solo se permiten imágenes de máximo 5MB.",
        variant: "destructive",
      });
    }

    setSelectedPhotos(prev => [...prev, ...validFiles].slice(0, 4)); // Max 4 photos
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (selectedPhotos.length === 0) return [];

    setIsUploading(true);
    const photoUrls: string[] = [];

    try {
      for (const photo of selectedPhotos) {
        const formData = new FormData();
        formData.append('photo', photo);
        formData.append('type', 'review');

        const response = await fetch('/api/upload/photo', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          photoUrls.push(result.url);
        }
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: "Error subiendo fotos",
        description: "Algunas fotos no se pudieron subir.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }

    return photoUrls;
  };

  const onSubmit = async (data: PhotoReviewFormData) => {
    if (!isAuthenticated) {
      toast({
        title: "Debes iniciar sesión",
        description: "Inicia sesión para enviar una reseña.",
        variant: "destructive",
      });
      return;
    }

    try {
      const photoUrls = await uploadPhotos();
      
      await submitReviewMutation.mutateAsync({
        ...data,
        rating: selectedRating,
        workQuality,
        communication,
        punctuality,
        value,
        tags: selectedTags,
        photos: photoUrls,
      });
    } catch (error) {
      console.error('Review submission error:', error);
    }
  };

  const renderStarRating = (
    value: number, 
    setValue: (value: number) => void, 
    label: string,
    icon?: React.ReactNode
  ) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer transition-colors ${
              star <= value
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-gray-300 hover:text-yellow-500'
            }`}
            onClick={() => setValue(star)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escribir Reseña con Fotos</DialogTitle>
          <DialogDescription>
            Comparte tu experiencia y ayuda a otros usuarios con fotos del trabajo realizado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Overall Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Calificación General</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 cursor-pointer transition-colors ${
                      star <= (hoverRating || selectedRating)
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-gray-300 hover:text-yellow-500'
                    }`}
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
            </div>

            {/* Detailed Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderStarRating(workQuality, setWorkQuality, "Calidad del Trabajo", <ThumbsUp className="h-4 w-4" />)}
              {renderStarRating(communication, setCommunication, "Comunicación", <MessageCircle className="h-4 w-4" />)}
              {renderStarRating(punctuality, setPunctuality, "Puntualidad", <Clock className="h-4 w-4" />)}
              {renderStarRating(value, setValue, "Relación Precio/Calidad", <DollarSign className="h-4 w-4" />)}
            </div>

            {/* Photo Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Fotos del Trabajo (Opcional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={selectedPhotos.length >= 4}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Fotos
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Máximo 4 fotos, 5MB cada una
                  </p>
                </div>
              </div>

              {/* Photo Preview */}
              {selectedPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {selectedPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Tags */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Tags de Calidad</label>
              <div className="flex flex-wrap gap-2">
                {QUALITY_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

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
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={selectedRating === 0 || submitReviewMutation.isPending || isUploading}
              >
                {(submitReviewMutation.isPending || isUploading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isUploading ? 'Subiendo fotos...' : 'Enviar Reseña'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}