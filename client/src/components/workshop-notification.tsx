import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";

export function WorkshopNotification() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const checkNotification = () => {
      const stored = localStorage.getItem('newWorkshopNotification');
      if (stored) {
        const notif = JSON.parse(stored);
        // Show notification if it's less than 1 hour old
        if (Date.now() - notif.timestamp < 3600000) {
          setNotification(notif);
        } else {
          localStorage.removeItem('newWorkshopNotification');
        }
      }
    };

    checkNotification();
    const interval = setInterval(checkNotification, 5000);
    return () => clearInterval(interval);
  }, []);

  const dismissNotification = () => {
    setNotification(null);
    localStorage.removeItem('newWorkshopNotification');
  };

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <Card className="border-primary shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">New Workshop Added!</h4>
                <p className="text-sm text-muted-foreground">{notification.title}</p>
                <p className="text-xs text-muted-foreground">
                  {notification.date} at {notification.time}
                </p>
                <p className="text-xs text-muted-foreground">{notification.location}</p>
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