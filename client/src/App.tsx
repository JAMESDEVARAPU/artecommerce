import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationProvider } from "@/lib/notification-context";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/error-boundary";
import { HealthCheck } from "@/components/health-check";
import { WorkshopNotification } from "@/components/workshop-notification";
import { ProductNotification } from "@/components/product-notification";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Gallery from "@/pages/gallery";
import Shop from "@/pages/shop";

import Workshops from "@/pages/workshops";
import Contact from "@/pages/contact";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import Profile from "@/pages/profile";
import Addresses from "@/pages/addresses";
import Admin from "@/pages/admin";
import Login from "@/pages/login";
import LoginSelect from "@/pages/login-select";
import Register from "@/pages/register";
import AdminLogin from "@/pages/admin-login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/shop" component={Shop} />

      <Route path="/workshops" component={Workshops} />
      <Route path="/contact" component={Contact} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders" component={Orders} />
      <Route path="/profile" component={Profile} />
      <Route path="/addresses" component={Addresses} />
      <Route path="/login-select" component={LoginSelect} />
      <Route path="/login" component={Login} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/register" component={Register} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="artistry-theme">
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <TooltipProvider>
              <div className="min-h-screen flex flex-col bg-background">
                <WorkshopNotification />
                <ProductNotification />
                <Navigation />
                <div className="flex-1">
                  <Router />
                </div>
                <Footer />
              </div>
              <Toaster />
              </TooltipProvider>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
