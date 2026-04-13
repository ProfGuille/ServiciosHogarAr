import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer_first_name: string;
  provider_business_name: string;
  category_name: string;
  created_at: string;
}

function TestimonialCard({ review }: { review: Review }) {
  const initials = review.reviewer_first_name?.charAt(0)?.toUpperCase() || "C";
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{review.reviewer_first_name || "Cliente"}</h4>
              <Badge variant="outline" className="mt-1 text-xs">{review.category_name || review.provider_business_name}</Badge>
            </div>
          </div>
          <Quote className="h-8 w-8 text-blue-200 flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">"{review.comment}"</p>
      </CardContent>
    </Card>
  );
}

export function TestimonialSection() {
  const { data: reviews } = useQuery<Review[]>({
    queryKey: ["recent-reviews-public"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/providers/reviews/recent`);
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
  });

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-slate-600">
            Reseñas reales de clientes que encontraron su profesional en ServiciosHogar
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.slice(0, 4).map((review) => (
            <TestimonialCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
