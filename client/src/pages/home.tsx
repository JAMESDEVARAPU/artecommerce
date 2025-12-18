import { Link } from "wouter";
import { ArrowRight, Brush, GraduationCap, Users, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";

type Testimonial = {
  id: string;
  authorName: string;
  role?: string | null;
  content: string;
  rating?: number;
  isVisible?: boolean;
};

type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
};

const heroImage = "/attached_assets/generated_images/artist_workspace_hero_image.png";
const ceramicImage = "/attached_assets/generated_images/WhatsApp Image 2025-12-18 at 15.47.39_7f32124b.jpg";
const classImage = "/attached_assets/generated_images/kids_art_class_setting.png";
const workshopImage = "/attached_assets/generated_images/WhatsApp Image 2025-12-18 at 15.41.54_dddb4343.jpg";

function HeroSection() {
  return (
    <section
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
      data-testid="section-hero"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 leading-tight">
          Where Art Meets<br />
          <span className="font-normal">Imagination</span>
        </h1>
        <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Welcome to Handmade by Tejasree - your premier destination for handcrafted art, creative learning, and artistic inspiration. 
          We specialize in unique home décor, personalized gifts, and offer comprehensive art education through classes and workshops.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <Button
              size="lg"
              className="backdrop-blur-sm bg-primary/90 border-primary-border font-accent text-base px-8"
              data-testid="button-hero-shop"
            >
              Shop Collection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-white/50 rounded-full mt-2" />
        </div>
      </div>
    </section>
  );
}

function AboutOverview() {
  return (
    <section className="py-16 md:py-20 bg-muted/30" data-testid="section-about-overview">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-normal mb-4">
            About Handmade by Tejasree
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
            Founded with a passion for creativity and craftsmanship, Handmade by Tejasree is more than just an art store - 
            we're a vibrant community where art comes to life. Our mission is to inspire creativity, 
            foster artistic growth, and bring beautiful handmade pieces into your everyday life.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brush className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-xl mb-2">Handcrafted Excellence</h3>
            <p className="text-muted-foreground">Every piece in our collection is carefully crafted by skilled artisans, ensuring unique quality and character.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-xl mb-2">Creative Education</h3>
            <p className="text-muted-foreground">Learn from experienced instructors in our structured classes and hands-on workshops for all skill levels.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-xl mb-2">Community Focus</h3>
            <p className="text-muted-foreground">Join a supportive community of artists, learners, and art enthusiasts who share your passion for creativity.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewProductsSection() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const newProducts = products?.slice(0, 3) || [];

  return (
    <section className="py-16 md:py-20 bg-background" data-testid="section-new-products">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-normal mb-4">
            Latest Arrivals
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our newest handcrafted pieces, fresh from the studio
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/5] w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : newProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-[4/5] overflow-hidden bg-muted relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Brush className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                      New
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-medium truncate mb-1">{product.name}</h4>
                  <p className="text-muted-foreground text-sm truncate mb-2">{product.description}</p>
                  <p className="text-primary font-accent font-semibold">
                    ₹{parseFloat(product.price).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Brush className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>New products coming soon</p>
          </div>
        )}
        
        <div className="text-center mt-8">
          <Link href="/shop">
            <Button variant="outline" className="font-accent">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function UpcomingEventsSection() {
  const { data: workshops } = useQuery({
    queryKey: ["/api/workshops"],
  });

  const upcomingWorkshops = workshops?.filter(w => !w.isPast).slice(0, 2) || [];

  return (
    <section className="py-16 md:py-20 bg-card" data-testid="section-upcoming-events">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-normal mb-4">
            Upcoming Events
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join our upcoming workshops and creative sessions
          </p>
        </div>


      </div>
    </section>
  );
}

function CategoryShowcase() {
  const categories = [
    {
      title: "Handmade Art & Décor",
      description:
        "Transform your space with unique, handcrafted pieces that bring warmth and character to any room. Each creation is made with love and attention to detail.",
      image: ceramicImage,
      link: "/shop",
      linkText: "Shop Collection",
      icon: Brush,
    },

    {
      title: "Creative Workshops",
      description:
        "Join our hands-on workshops for a fun, immersive experience. Perfect for team building, celebrations, or simply exploring new art forms.",
      image: workshopImage,
      link: "/workshops",
      linkText: "Browse Workshops",
      icon: Users,
    },
  ];

  return (
    <section className="py-20 md:py-24 lg:py-28 bg-background" data-testid="section-categories">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-normal mb-4">
            Explore Our World
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From beautiful handcrafted pieces to enriching creative experiences
          </p>
        </div>

        <div className="space-y-20">
          {categories.map((category, index) => (
            <div
              key={category.title}
              className={`flex flex-col gap-8 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
              } items-center`}
            >
              <div className="w-full lg:w-3/5">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="w-full lg:w-2/5 space-y-6">
                <div className="inline-flex items-center gap-2 text-primary">
                  <category.icon className="h-5 w-5" />
                  <span className="font-accent text-sm uppercase tracking-wider">
                    {index === 0 ? "Shop" : index === 1 ? "Learn" : "Experience"}
                  </span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-normal">
                  {category.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
                <Link href={category.link}>
                  <Button
                    variant="outline"
                    className="font-accent"
                    data-testid={`button-category-${index}`}
                  >
                    {category.linkText}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products?.filter((p) => p.featured).slice(0, 4) || [];

  return (
    <section className="py-20 md:py-24 bg-card" data-testid="section-featured">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-normal mb-2">
              Featured Creations
            </h2>
            <p className="text-muted-foreground">
              Handpicked pieces from our collection
            </p>
          </div>
          <Link href="/shop">
            <Button variant="ghost" className="font-accent" data-testid="link-view-all-products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/5] w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/shop?product=${product.id}`}>
                <Card
                  className="overflow-hidden group cursor-pointer hover-elevate"
                  data-testid={`card-product-${product.id}`}
                >
                  <div className="aspect-[4/5] overflow-hidden bg-muted">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Brush className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-medium truncate">{product.name}</h4>
                    <p className="text-primary font-accent">
                      ${parseFloat(product.price).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Brush className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Featured products coming soon</p>
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const visibleTestimonials = testimonials?.filter((t) => t.isVisible).slice(0, 4) || [];

  return (
    <section className="py-20 md:py-24 bg-background" data-testid="section-testimonials">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-normal mb-4">
            What People Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stories from our students, customers, and creative community
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-24 w-full mb-4" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : visibleTestimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleTestimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="p-6"
                data-testid={`card-testimonial-${testimonial.id}`}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.authorName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{testimonial.authorName}</p>
                    {testimonial.role && (
                      <p className="text-sm text-muted-foreground capitalize">
                        {testimonial.role}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Testimonials coming soon</p>
          </div>
        )}
      </div>
    </section>
  );
}

function GalleryPreview() {
  const { data: galleryItems, isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  const previewItems = galleryItems?.slice(0, 6) || [];

  return (
    <section className="py-20 md:py-24 bg-card" data-testid="section-gallery-preview">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-normal mb-2">
              From the Gallery
            </h2>
            <p className="text-muted-foreground">
              A glimpse into our creative portfolio
            </p>
          </div>
          <Link href="/gallery">
            <Button variant="ghost" className="font-accent" data-testid="link-view-gallery">
              View Full Gallery
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : previewItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previewItems.map((item) => (
              <div
                key={item.id}
                className="aspect-square rounded-lg overflow-hidden group cursor-pointer"
                data-testid={`gallery-preview-${item.id}`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Brush className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Gallery items coming soon</p>
          </div>
        )}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 md:py-24 bg-primary" data-testid="section-cta">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-normal text-primary-foreground mb-4">
          Ready to Start Your Creative Journey?
        </h2>
        <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
          Whether you want to learn, create, or find the perfect handmade piece,
          we're here to help you explore your artistic side.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          <Link href="/contact">
            <Button
              size="lg"
              variant="outline"
              className="font-accent text-base px-8 bg-transparent border-primary-foreground/30 text-primary-foreground"
              data-testid="button-cta-contact"
            >
              Get in Touch
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutOverview />
      <NewProductsSection />
      <UpcomingEventsSection />
      <CategoryShowcase />
      <FeaturedProducts />



    </main>
  );
}
