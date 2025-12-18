import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, X, ShoppingCart } from "lucide-react";
import { Link } from "wouter";

export function ProductNotification() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const checkNotification = () => {
      const stored = localStorage.getItem('newProductNotification');
      if (stored) {
        const notif = JSON.parse(stored);
        if (Date.now() - notif.timestamp < 3600000) {
          setNotification(notif);
        } else {
          localStorage.removeItem('newProductNotification');
        }
      }
    };

    checkNotification();
    const interval = setInterval(checkNotification, 5000);
    return () => clearInterval(interval);
  }, []);

  const dismissNotification = () => {
    setNotification(null);
    localStorage.removeItem('newProductNotification');
  };

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <Card className="border-green-500 shadow-lg bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <Package className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-green-800">New Product Added!</h4>
                <p className="text-sm text-green-700">{notification.name}</p>
                <p className="text-xs text-green-600">₹{notification.price} • {notification.category}</p>
                <Link href="/shop">
                  <Button size="sm" className="mt-2 h-6 text-xs">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissNotification}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}