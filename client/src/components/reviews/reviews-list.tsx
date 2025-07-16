import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ReviewsListProps {
  providerId: number;
  limit?: number;
}

export function ReviewsList({ providerId, limit }: ReviewsListProps) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: [`/api/providers/${providerId}/reviews`],
  });

  const displayReviews = limit ? reviews?.slice(0, limit) : reviews;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-start space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin reseñas aún
          </h3>
          <p className="text-gray-500">
            Este profesional aún no tiene reseñas. ¡Sé el primero en dejar una!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {displayReviews.map((review: any) => (
        <Card key={review.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.customer?.profileImageUrl} />
                  <AvatarFallback>
                    {review.customer?.firstName?.[0] || review.customer?.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">
                      {review.customer?.firstName} {review.customer?.lastName || ""}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Verificado
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(review.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {review.comment}
            </p>
            {review.serviceType && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Servicio: <span className="font-medium">{review.serviceType}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {limit && reviews.length > limit && (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center">
            <p className="text-gray-500">
              Ver todas las {reviews.length} reseñas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}