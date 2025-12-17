import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ShoppingBag, Brush, Filter, X, Plus, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Product } from "@shared/schema";

const categories = [
  { value: "all", label: "All Products" },
  { value: "decor", label: "Home Décor" },
  { value: "gifts", label: "Gifts" },
  { value: "paintings", label: "Paintings" },
  { value: "crafts", label: "Crafts" },
];

const customOrderSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().min(10, "Please provide a complete address"),
  customOrderDetails: z.string().min(20, "Please describe your custom order in detail"),
});

type CustomOrderForm = z.infer<typeof customOrderSchema>;

function ProductCard({ product }: { product: Product }) {
  const [showDetails, setShowDetails] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
    });
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added to your cart`,
    });
    setShowDetails(false);
    setQuantity(1);
  };

  return (
    <>
      <Card
        className="overflow-hidden group cursor-pointer hover-elevate"
        onClick={() => setShowDetails(true)}
        data-testid={`card-product-${product.id}`}
      >
        <div className="aspect-[4/5] overflow-hidden bg-muted relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Brush className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          {product.isCustomizable && (
            <Badge className="absolute top-3 left-3" variant="secondary">
              Customizable
            </Badge>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h4 className="font-medium truncate">{product.name}</h4>
          <p className="text-muted-foreground text-sm truncate mb-2">
            {product.description}
          </p>
          <p className="text-primary font-accent font-semibold">
            ${parseFloat(product.price).toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Brush className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3 className="font-display text-2xl">{product.name}</h3>
                  {product.isCustomizable && (
                    <Badge variant="secondary">Customizable</Badge>
                  )}
                </div>
                <p className="text-primary font-accent text-xl font-semibold mt-1">
                  ${parseFloat(product.price).toFixed(2)}
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    data-testid="button-decrease-quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    data-testid="button-increase-quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={!product.inStock}
                onClick={handleAddToCart}
                data-testid="button-add-to-cart"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CustomOrderForm() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CustomOrderForm>({
    resolver: zodResolver(customOrderSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      customOrderDetails: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CustomOrderForm) => {
      const response = await apiRequest("POST", "/api/orders", {
        ...data,
        isCustomOrder: true,
        totalAmount: "0",
        status: "pending",
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Custom order submitted!",
        description: "We'll review your request and get back to you soon.",
      });
      setIsOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit custom order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CustomOrderForm) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="font-accent"
        data-testid="button-custom-order"
      >
        Request Custom Order
      </Button>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Custom Order Request
          </DialogTitle>
          <DialogDescription>
            Tell us about the custom piece you'd like. We'll review your request
            and provide a quote.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} data-testid="input-custom-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} data-testid="input-custom-email" />
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
                    <Input placeholder="+1 (555) 123-4567" {...field} data-testid="input-custom-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shippingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Your complete shipping address..."
                      {...field}
                      data-testid="input-custom-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customOrderDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe Your Custom Order</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe what you'd like us to create, including size, colors, materials, and any special requirements..."
                      className="min-h-[120px]"
                      {...field}
                      data-testid="input-custom-details"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
              data-testid="button-submit-custom-order"
            >
              {mutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products?.filter((p) => p.category === selectedCategory);

  return (
    <main className="pt-24" data-testid="page-shop">
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-normal mb-2">
                Shop
              </h1>
              <p className="text-muted-foreground">
                Unique handmade pieces crafted with love
              </p>
            </div>
            <CustomOrderForm />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                className="font-accent text-sm"
                onClick={() => setSelectedCategory(category.value)}
                data-testid={`button-filter-${category.value}`}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[4/5] w-full" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-5 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="font-display text-xl mb-2">No products yet</h3>
              <p>Check back soon for our handmade collection</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
