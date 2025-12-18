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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-7 w-7 text-primary" />
              <span className="font-display text-xl font-semibold">Handmade by Tejasree</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Creating handmade art with love and passion. Every piece tells a unique story.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://www.instagram.com/aspirants_art/?igsh=bG12N3Z0OWhsNG11#"
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
                  href="https://wa.me/919959421890"
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
              Contact
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:devarapujames@gmail.com" className="hover:text-foreground transition-colors">
                  devarapujames@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 9959421890</span>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-1" />
                <span>Gachibowli, Hyderabad</span>
              </div>
            </div>
          </div>


        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; 2024 Handmade by Tejasree. All rights reserved.</p>
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
