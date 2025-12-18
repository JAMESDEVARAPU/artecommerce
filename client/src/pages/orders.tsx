import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Calendar, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function Orders() {
  const { user } = useAuth();
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/user/orders"],
    queryFn: async () => {
      // Since we don't have user-specific orders endpoint, we'll use localStorage for demo
      const userOrders = localStorage.getItem(`userOrders_${user?.username}`);
      return userOrders ? JSON.parse(userOrders) : [];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display mb-2">Please login to view orders</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-display text-3xl mb-8">Order History</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : orders?.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id?.slice(-8)}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : "N/A"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {order.items?.length || 0} items
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">₹{parseFloat(order.totalAmount).toFixed(2)}</p>
                      <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                        {order.status === 'new' ? 'Processing' : 
                         order.status === 'in_progress' ? 'In Progress' : 
                         order.status === 'completed' ? 'Completed' : 
                         order.status === 'delivered' ? 'Delivered' : 
                         order.status || 'Processing'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {order.items && (
                    <div className="space-y-2 mb-4">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{item.productName} x {item.quantity}</span>
                          <span>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {order.shippingAddress && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{order.shippingAddress}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-display text-xl mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Start shopping to see your orders here</p>
          </div>
        )}
      </div>
    </main>
  );
}