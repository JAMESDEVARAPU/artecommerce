import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Gallery from "@/pages/gallery";
import Shop from "@/pages/shop";
import Classes from "@/pages/classes";
import Workshops from "@/pages/workshops";
import Contact from "@/pages/contact";
import Cart from "@/pages/cart";
import Admin from "@/pages/admin";
import Login from "@/pages/login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/shop" component={Shop} />
      <Route path="/classes" component={Classes} />
      <Route path="/workshops" component={Workshops} />
      <Route path="/contact" component={Contact} />
      <Route path="/cart" component={Cart} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="artistry-theme">
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <div className="min-h-screen flex flex-col bg-background">
                <Navigation />
                <div className="flex-1">
                  <Router />
                </div>
                <Footer />
              </div>
              <Toaster />
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
