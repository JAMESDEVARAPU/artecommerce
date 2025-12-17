import { Link } from "wouter";
import { Palette, Mail, Phone, MapPin } from "lucide-react";
import { SiInstagram, SiFacebook, SiPinterest, SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-7 w-7 text-primary" />
              <span className="font-display text-xl font-semibold">Artistry Studio</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Creating handmade art with love and passion. Every piece tells a unique story.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-social-instagram"
                >
                  <SiInstagram className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-social-facebook"
                >
                  <SiFacebook className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-social-pinterest"
                >
                  <SiPinterest className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-social-whatsapp"
                >
                  <SiWhatsapp className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-accent font-semibold text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href="/shop">
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-shop">
                  Shop Collection
                </span>
              </Link>
              <Link href="/classes">
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-classes">
                  Art Classes
                </span>
              </Link>
              <Link href="/workshops">
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-workshops">
                  Workshops
                </span>
              </Link>
              <Link href="/gallery">
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-gallery">
                  Gallery
                </span>
              </Link>
              <Link href="/about">
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-about">
                  About Artist
                </span>
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-accent font-semibold text-sm uppercase tracking-wider">
              Contact
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>hello@artistrystudio.com</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-1" />
                <span>123 Creative Lane<br />Art District, CA 90210</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-accent font-semibold text-sm uppercase tracking-wider">
              Newsletter
            </h4>
            <p className="text-muted-foreground text-sm">
              Subscribe for updates on new art, classes, and exclusive offers.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Your email"
                className="flex-1"
                data-testid="input-newsletter-email"
              />
              <Button type="submit" data-testid="button-newsletter-subscribe">
                Join
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; 2024 Artistry Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-foreground transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-foreground transition-colors cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
