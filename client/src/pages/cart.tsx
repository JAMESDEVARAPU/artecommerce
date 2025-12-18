import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().min(10, "Please provide a complete shipping address"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: { productId: string; productName: string; price: string; quantity: number; imageUrl?: string | null };
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="flex gap-4 py-4"
      data-testid={`cart-item-${item.productId}`}
    >
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{item.productName}</h4>
        <p className="text-primary font-accent">
          ₹{parseFloat(item.price).toFixed(2)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            data-testid={`button-decrease-${item.productId}`}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            data-testid={`button-increase-${item.productId}`}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={onRemove}
          data-testid={`button-remove-${item.productId}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <p className="font-semibold">
          ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const [isCheckout, setIsCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const { toast } = useToast();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      const orderData = {
        ...data,
        totalAmount: totalPrice.toFixed(2),
        status: "pending",
        isCustomOrder: false,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
      };
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response;
    },
    onSuccess: () => {
      setOrderComplete(true);
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: () => {
      toast({
        title: "Order failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutForm) => {
    mutation.mutate(data);
  };

  if (orderComplete) {
    return (
      <main className="pt-24" data-testid="page-order-complete">
        <section className="py-16 md:py-20">
          <div className="max-w-lg mx-auto px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-normal mb-4">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your order! We've received your purchase and will send
              you a confirmation email with all the details shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <Button data-testid="button-continue-shopping">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" data-testid="button-go-home">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="pt-24" data-testid="page-cart-empty">
        <section className="py-16 md:py-20">
          <div className="max-w-lg mx-auto px-6 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-6 text-muted-foreground/30" />
            <h1 className="font-display text-3xl md:text-4xl font-normal mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items yet. Browse our collection
              of handmade art and décor.
            </p>
            <Link href="/shop">
              <Button size="lg" data-testid="button-shop-now">
                Shop Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-24" data-testid="page-cart">
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/shop">
              <Button variant="ghost" size="icon" data-testid="button-back-to-shop">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-normal">
              {isCheckout ? "Checkout" : "Your Cart"}
            </h1>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              {!isCheckout ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="divide-y">
                      {items.map((item) => (
                        <CartItem
                          key={item.productId}
                          item={item}
                          onUpdateQuantity={(qty) => updateQuantity(item.productId, qty)}
                          onRemove={() => removeItem(item.productId)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-xl">
                      Shipping Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        id="checkout-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} data-testid="input-checkout-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="customerEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    {...field}
                                    data-testid="input-checkout-email"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="customerPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="+1 (555) 123-4567"
                                    {...field}
                                    data-testid="input-checkout-phone"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="shippingAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Shipping Address</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Street address, city, state, ZIP code..."
                                  className="min-h-[100px]"
                                  {...field}
                                  data-testid="input-checkout-address"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-2">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    {items.map((item) => (
                      <div key={item.productId} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {item.productName} x {item.quantity}
                        </span>
                        <span>
                          ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-primary">Free</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>

                  {!isCheckout ? (
                    <Link href="/checkout">
                      <Button
                        className="w-full"
                        size="lg"
                        data-testid="button-proceed-checkout"
                      >
                        Proceed to Checkout
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        size="lg"
                        type="submit"
                        form="checkout-form"
                        disabled={mutation.isPending}
                        data-testid="button-place-order"
                      >
                        {mutation.isPending ? (
                          "Processing..."
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Place Order
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setIsCheckout(false)}
                        data-testid="button-back-to-cart"
                      >
                        Back to Cart
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-center text-muted-foreground">
                    Payment will be collected upon order confirmation
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
