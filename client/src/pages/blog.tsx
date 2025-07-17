import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock } from "lucide-react";

export default function Blog() {
  useEffect(() => {
    document.title = "Blog - ServiciosHogar.com.ar";
    window.scrollTo(0, 0);
  }, []);

  const posts = [
    {
      title: "Consejos para elegir el mejor plomero para tu hogar",
      excerpt: "Descubre qué preguntas hacer y qué certificaciones buscar al contratar un profesional en plomería.",
      category: "Consejos",
      date: "15 Julio 2025",
      author: "Equipo ServiciosHogar",
      readTime: "5 min",
      image: "🔧"
    },
    {
      title: "Tendencias en decoración y remodelación 2025",
      excerpt: "Las últimas tendencias en diseño de interiores y cómo los profesionales pueden ayudarte a implementarlas.",
      category: "Tendencias",
      date: "10 Julio 2025",
      author: "María González",
      readTime: "7 min",
      image: "🎨"
    },
    {
      title: "Mantenimiento preventivo: ahorra dinero a largo plazo",
      excerpt: "Cómo el mantenimiento regular de tu hogar puede prevenir reparaciones costosas en el futuro.",
      category: "Mantenimiento",
      date: "5 Julio 2025",
      author: "Carlos Rodríguez",
      readTime: "6 min",
      image: "🏠"
    },
    {
      title: "Seguridad eléctrica: señales de alerta en tu hogar",
      excerpt: "Aprende a identificar problemas eléctricos antes de que se conviertan en peligros para tu familia.",
      category: "Seguridad",
      date: "1 Julio 2025",
      author: "Ana López",
      readTime: "4 min",
      image: "⚡"
    },
    {
      title: "Jardinería urbana: transforma tu balcón en un oasis",
      excerpt: "Guía práctica para crear un hermoso jardín en espacios pequeños con ayuda profesional.",
      category: "Jardinería",
      date: "28 Junio 2025",
      author: "Roberto Silva",
      readTime: "8 min",
      image: "🌿"
    },
    {
      title: "Limpieza profunda: cuando llamar a los profesionales",
      excerpt: "Conoce cuándo es momento de contratar servicios de limpieza profesional y qué esperar.",
      category: "Limpieza",
      date: "25 Junio 2025",
      author: "Laura Martín",
      readTime: "3 min",
      image: "🧽"
    }
  ];

  const categories = ["Todos", "Consejos", "Tendencias", "Mantenimiento", "Seguridad", "Jardinería", "Limpieza"];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Blog ServiciosHogar
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Consejos, tendencias y guías para mantener tu hogar en perfectas condiciones
          </p>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((category) => (
            <Badge 
              key={category} 
              variant={category === "Todos" ? "default" : "secondary"}
              className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Featured Post */}
        <Card className="mb-12 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-6xl p-8">
              {posts[0].image}
            </div>
            <div className="md:w-2/3 p-8">
              <Badge className="mb-4">{posts[0].category}</Badge>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                {posts[0].title}
              </h2>
              <p className="text-slate-600 text-lg mb-6">
                {posts[0].excerpt}
              </p>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {posts[0].date}
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {posts[0].author}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {posts[0].readTime}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map((post, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-8 text-center">
                <div className="text-4xl mb-4">{post.image}</div>
                <Badge variant="secondary">{post.category}</Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <Card className="mt-16 text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">
              Suscríbete a nuestro newsletter
            </h2>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Recibe consejos exclusivos, ofertas especiales y las últimas novedades 
              del mundo de los servicios para el hogar directamente en tu email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Suscribirse
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}