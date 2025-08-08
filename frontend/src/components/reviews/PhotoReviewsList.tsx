import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  ThumbsUp, 
  MessageCircle, 
  Clock, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Verified
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerId: number;
  photos?: string[];
  isVerified?: boolean;
  helpfulCount?: number;
  responseFromProvider?: string;
  responseCreatedAt?: string;
  tags?: string[];
  workQuality?: number;
  communication?: number;
  punctuality?: number;
  value?: number;
  reviewer?: {
    id: number;
    name: string;
    profileImageUrl?: string;
  };
}

interface PhotoReviewsListProps {
  providerId: number;
  className?: string;
}

export function PhotoReviewsList({ providerId, className = "" }: PhotoReviewsListProps) {
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['reviews', providerId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/reviews/provider/${providerId}`);
      return response.json();
    },
  });

  const toggleExpanded = (reviewId: number) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const renderStars = (rating: number, size = "w-4 h-4") => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderSubRating = (label: string, rating: number, icon: React.ReactNode) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center space-x-2 text-sm">
        {icon}
        <span className="text-gray-600">{label}:</span>
        {renderStars(rating, "w-3 h-3")}
        <span className="text-gray-500">({rating}/5)</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Sin reseñas aún</h3>
          <p className="text-gray-500">
            Sé el primero en dejar una reseña para este profesional.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {reviews.map((review) => {
        const isExpanded = expandedReviews.has(review.id);
        const hasPhotos = review.photos && review.photos.length > 0;
        const hasSubRatings = review.workQuality || review.communication || review.punctuality || review.value;
        
        return (
          <Card key={review.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Reviewer Avatar */}
                <Avatar className="w-12 h-12">
                  <AvatarImage src={review.reviewer?.profileImageUrl} />
                  <AvatarFallback>
                    {review.reviewer?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{review.reviewer?.name || 'Usuario Anónimo'}</h4>
                      {review.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          <Verified className="w-3 h-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(review.createdAt), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-3">
                    {renderStars(review.rating)}
                    <span className="font-medium">{review.rating}/5</span>
                    {hasPhotos && (
                      <Badge variant="outline" className="text-xs">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        Con fotos
                      </Badge>
                    )}
                  </div>

                  {/* Photos */}
                  {hasPhotos && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {review.photos!.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Foto de reseña ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedImage(photo)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Comment */}
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Tags */}
                  {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {review.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Sub-ratings (collapsible) */}
                  {hasSubRatings && (
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(review.id)}
                        className="p-0 h-auto text-sm text-blue-600 hover:text-blue-800"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Menos detalles
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Ver calificaciones detalladas
                          </>
                        )}
                      </Button>

                      {isExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 p-3 bg-gray-50 rounded-lg">
                          {renderSubRating("Calidad del trabajo", review.workQuality || 0, <ThumbsUp className="w-4 h-4" />)}
                          {renderSubRating("Comunicación", review.communication || 0, <MessageCircle className="w-4 h-4" />)}
                          {renderSubRating("Puntualidad", review.punctuality || 0, <Clock className="w-4 h-4" />)}
                          {renderSubRating("Relación precio/calidad", review.value || 0, <DollarSign className="w-4 h-4" />)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Provider Response */}
                  {review.responseFromProvider && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary">Respuesta del profesional</Badge>
                        <span className="text-sm text-gray-500">
                          {review.responseCreatedAt && formatDistanceToNow(new Date(review.responseCreatedAt), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.responseFromProvider}</p>
                    </div>
                  )}

                  {/* Helpful Button */}
                  <div className="flex items-center space-x-4 pt-2">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Útil {review.helpfulCount ? `(${review.helpfulCount})` : ''}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Foto ampliada"
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setSelectedImage(null)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}