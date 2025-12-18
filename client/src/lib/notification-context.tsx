import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Calendar } from "lucide-react";
import { Link } from "wouter";

type NotificationContextType = {
  showProductNotification: (product: { name: string; price: string; category: string }) => void;
  showWorkshopNotification: (workshop: { title: string; date: string; price: string }) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const showProductNotification = (product: { name: string; price: string; category: string }) => {
    toast({
      title: "🎨 New Product Added!",
      description: (
        <div className="space-y-2">
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-muted-foreground">₹{product.price} • {product.category}</p>
          <Link href="/shop">
            <Button size="sm" className="mt-2">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Shop Now
            </Button>
          </Link>
        </div>
      ),
      duration: 3600000, // 1 hour
    });
  };

  const showWorkshopNotification = (workshop: { title: string; date: string; price: string }) => {
    toast({
      title: "🎭 New Workshop Added!",
      description: (
        <div className="space-y-2">
          <p className="font-medium">{workshop.title}</p>
          <p className="text-sm text-muted-foreground">{workshop.date} • ₹{workshop.price}</p>
          <Link href="/workshops">
            <Button size="sm" className="mt-2">
              <Calendar className="h-4 w-4 mr-2" />
              View Workshops
            </Button>
          </Link>
        </div>
      ),
      duration: 3600000, // 1 hour
    });
  };

  return (
    <NotificationContext.Provider value={{ showProductNotification, showWorkshopNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}