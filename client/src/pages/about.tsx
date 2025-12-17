import { Link } from "wouter";
import { Award, Heart, Users, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import workshopImage from "@assets/generated_images/adult_workshop_scene.png";

export default function About() {
  const achievements = [
    {
      icon: Award,
      title: "10+ Years",
      description: "Teaching art and crafts",
    },
    {
      icon: Users,
      title: "500+",
      description: "Students taught",
    },
    {
      icon: Heart,
      title: "1000+",
      description: "Handmade pieces created",
    },
    {
      icon: Sparkles,
      title: "50+",
      description: "Workshops conducted",
    },
  ];

  return (
    <main className="pt-24" data-testid="page-about">
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 space-y-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <Heart className="h-4 w-4" />
                <span className="font-accent text-sm uppercase tracking-wider">
                  The Story
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-normal leading-tight">
                Art is not just what I do,<br />
                <span className="text-primary">it's who I am</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Hello! I'm Maya, a passionate art educator and handmade artist based in 
                California. For over a decade, I've been creating unique pieces that 
                bring joy to homes and teaching others to discover their own creative voice.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                My journey began in a small studio with a simple dream: to share the 
                transformative power of art with everyone. Today, that dream has grown 
                into Artistry Studio, a creative space where handmade art meets 
                education, and where every person can find their inner artist.
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <div className="aspect-[4/3] rounded-xl overflow-hidden">
                <img
                  src={workshopImage}
                  alt="Artist at work"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((item, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="p-0 space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-3xl font-semibold text-primary">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-normal mb-4">
              My Teaching Philosophy
            </h2>
            <p className="text-muted-foreground">
              Creating a nurturing space where creativity flourishes
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-display text-xl font-medium">
                Everyone is an Artist
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                I believe that creativity lives within each of us. My role is not to 
                teach you "how to be creative" but to help you rediscover the artist 
                you already are. Whether you're a complete beginner or an experienced 
                creator, there's always something new to explore.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-xl font-medium">
                Process Over Perfection
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                In my classes and workshops, we celebrate the journey, not just the 
                destination. Making mistakes is part of learning, and some of the most 
                beautiful creations come from happy accidents. I encourage experimentation 
                and play, because that's where true creativity emerges.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-xl font-medium">
                Art as Connection
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Art has the power to connect us—to ourselves, to each other, and to 
                the world around us. Whether you're crafting a gift for someone special 
                or finding peace through painting, creating art is an act of love and 
                connection that transcends words.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-card">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-normal mb-4">
              What I Offer
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-medium">
                  Handmade Art
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Unique, handcrafted pieces including home décor, personalized gifts, 
                  and original paintings made with love and attention to detail.
                </p>
                <Link href="/shop">
                  <Button variant="link" className="p-0 h-auto font-accent" data-testid="link-about-shop">
                    Explore Shop
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-medium">
                  Art Classes
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Structured art classes for all ages and skill levels, available 
                  both online and in-person. From painting to crafts, find your 
                  creative path.
                </p>
                <Link href="/classes">
                  <Button variant="link" className="p-0 h-auto font-accent" data-testid="link-about-classes">
                    View Classes
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-medium">
                  Workshops
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  One-time immersive workshops perfect for exploring new techniques, 
                  team building events, or a fun creative outing with friends.
                </p>
                <Link href="/workshops">
                  <Button variant="link" className="p-0 h-auto font-accent" data-testid="link-about-workshops">
                    Browse Workshops
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-normal text-primary-foreground mb-4">
            Let's Create Together
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Whether you're looking for the perfect handmade piece or ready to 
            start your own creative journey, I'd love to hear from you.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              variant="secondary"
              className="font-accent text-base px-8"
              data-testid="button-about-contact"
            >
              Get in Touch
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
