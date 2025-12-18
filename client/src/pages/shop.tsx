import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ShoppingBag, Brush, Filter, X, Plus, Minus, Check, Heart, Star, Search, SlidersHorizontal, ArrowUpDown, Grid, List, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Product } from "@/types";

function ProductMediaGallery({ product }: { product: Product }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Combine main image with additional images
  let additionalImagesArray = [];
  if (product.additionalImages) {
    try {
      if (Array.isArray(product.additionalImages)) {
        additionalImagesArray = product.additionalImages;
      } else if (typeof product.additionalImages === 'string' && product.additionalImages.trim()) {
        if (product.additionalImages.startsWith('[')) {
          additionalImagesArray = JSON.parse(product.additionalImages);
        } else {
          additionalImagesArray = [product.additionalImages];
        }
      }
    } catch (e) {
      additionalImagesArray = [];
    }
  }
  
  const allImages = [product.imageUrl, ...additionalImagesArray].filter(Boolean);
  
  const currentImage = allImages[selectedImageIndex];
  
  return (
    <div className="space-y-4">
      {/* Main Image/Video Display */}
      <div className="aspect-square rounded-lg overflow-hidden bg-muted relative group">
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt={product.name}
              className={`w-full h-full object-cover cursor-zoom-in transition-transform duration-300 ${
                isZoomed ? 'scale-150' : 'hover:scale-105'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Click to zoom
            </div>
            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 text-white hover:bg-black/90 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1);
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 text-white hover:bg-black/90 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0);
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Brush className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
      </div>
      
      {/* Video Display */}
      {product.videoUrl && (
        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          <video
            src={product.videoUrl}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
        </div>
      )}
      
      {/* Thumbnail Gallery - Always show if multiple images */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {allImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
              selectedImageIndex === index ? 'border-primary' : 'border-transparent'
            } ${allImages.length === 1 ? 'opacity-50' : ''}`}
          >
            <img
              src={image}
              alt={`${product.name} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
      {allImages.length > 1 && (
        <p className="text-xs text-muted-foreground text-center">
          {allImages.length} images total
        </p>
      )}
    </div>
  );
}

const categories = [
  { value: "all", label: "All Products" },
  { value: "decor", label: "Home Décor" },
  { value: "gifts", label: "Gifts" },
  { value: "paintings", label: "Paintings" },
  { value: "crafts", label: "Crafts" },
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
  { value: "newest", label: "Newest First" },
];

const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-500", label: "Under ₹500" },
  { value: "500-1000", label: "₹500 - ₹1,000" },
  { value: "1000-2500", label: "₹1,000 - ₹2,500" },
  { value: "2500-5000", label: "₹2,500 - ₹5,000" },
  { value: "5000+", label: "Over ₹5,000" },
];

const customOrderSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().min(10, "Please provide a complete address"),
  customOrderDetails: z.string().min(20, "Please describe your custom order in detail"),
});

type CustomOrderForm = z.infer<typeof customOrderSchema>;

function ProductCard({ product, viewMode = "grid" }: { product: Product; viewMode?: "grid" | "list" }) {
  const [showDetails, setShowDetails] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Mock rating data (in real app, this would come from API)
  const rating = 4.2 + Math.random() * 0.8;
  const reviewCount = Math.floor(Math.random() * 200) + 10;

  const { data: likeData } = useQuery({
    queryKey: [`/api/products/${product.id}/likes`],
    enabled: !!user,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (likeData?.liked) {
        await apiRequest("DELETE", `/api/products/${product.id}/like`);
      } else {
        await apiRequest("POST", `/api/products/${product.id}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${product.id}/likes`] });
      toast({ title: likeData?.liked ? "Removed from favorites" : "Added to favorites" });
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      return;
    }
    
    const finalPrice = product.discountPercent && product.discountPercent > 0
      ? (parseFloat(product.price) * (1 - product.discountPercent / 100)).toFixed(2)
      : product.price;
    
    addItem({
      productId: product.id,
      productName: product.name,
      price: finalPrice,
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

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden group cursor-pointer hover-elevate" onClick={() => setShowDetails(true)}>
        <div className="flex gap-4 p-4">
          <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Brush className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-lg">{product.name}</h4>
              {user && (
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); likeMutation.mutate(); }}>
                  <Heart className={`h-4 w-4 ${likeData?.liked ? 'fill-current text-red-500' : ''}`} />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({reviewCount})</span>
            </div>
            <p className="text-muted-foreground text-sm line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {product.discountPercent && product.discountPercent > 0 ? (
                  <>
                    <p className="text-primary font-semibold text-lg">
                      ₹{(parseFloat(product.price) * (1 - product.discountPercent / 100)).toFixed(2)}
                    </p>
                    <p className="text-muted-foreground text-sm line-through">
                      ₹{parseFloat(product.price).toFixed(2)}
                    </p>
                    <Badge variant="destructive" className="text-xs">{product.discountPercent}% OFF</Badge>
                  </>
                ) : (
                  <p className="text-primary font-semibold text-lg">₹{parseFloat(product.price).toFixed(2)}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" disabled={product.stockStatus === 'out_of_stock'} onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}>
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

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
          {product.stockStatus === 'out_of_stock' && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
          {product.stockStatus === 'limited' && (
            <Badge className="absolute top-3 right-3" variant="destructive">
              Limited Stock
            </Badge>
          )}
          {(() => {
            let additionalCount = 0;
            if (product.additionalImages) {
              try {
                if (Array.isArray(product.additionalImages)) {
                  additionalCount = product.additionalImages.length;
                } else if (typeof product.additionalImages === 'string') {
                  if (product.additionalImages.startsWith('[')) {
                    additionalCount = JSON.parse(product.additionalImages).length;
                  } else {
                    additionalCount = 1;
                  }
                }
              } catch (e) {
                additionalCount = 0;
              }
            }
            return additionalCount > 0 ? (
              <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
                +{additionalCount + 1} photos
              </div>
            ) : null;
          })()}
          {product.videoUrl && (
            <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
              📹 Video
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium truncate flex-1">{product.name}</h4>
            {user && (
              <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={(e) => { e.stopPropagation(); likeMutation.mutate(); }}>
                <Heart className={`h-4 w-4 ${likeData?.liked ? 'fill-current text-red-500' : ''}`} />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
          </div>
          <p className="text-muted-foreground text-sm truncate mb-3">
            {product.description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {product.discountPercent && product.discountPercent > 0 ? (
                <>
                  <p className="text-primary font-accent font-semibold">
                    ₹{(parseFloat(product.price) * (1 - product.discountPercent / 100)).toFixed(2)}
                  </p>
                  <p className="text-muted-foreground text-sm line-through">
                    ₹{parseFloat(product.price).toFixed(2)}
                  </p>
                  <Badge variant="destructive" className="text-xs">
                    {product.discountPercent}% OFF
                  </Badge>
                </>
              ) : (
                <p className="text-primary font-accent font-semibold">
                  ₹{parseFloat(product.price).toFixed(2)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Secure payment</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6">
            <ProductMediaGallery product={product} />
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3 className="font-display text-2xl">{product.name}</h3>
                  {product.isCustomizable && (
                    <Badge variant="secondary">Customizable</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {product.discountPercent && product.discountPercent > 0 ? (
                    <>
                      <p className="text-primary font-accent text-xl font-semibold">
                        ₹{(parseFloat(product.price) * (1 - product.discountPercent / 100)).toFixed(2)}
                      </p>
                      <p className="text-muted-foreground line-through">
                        ₹{parseFloat(product.price).toFixed(2)}
                      </p>
                      <Badge variant="destructive">
                        {product.discountPercent}% OFF
                      </Badge>
                    </>
                  ) : (
                    <p className="text-primary font-accent text-xl font-semibold">
                      ₹{parseFloat(product.price).toFixed(2)}
                    </p>
                  )}
                </div>
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
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  size="lg"
                  disabled={product.stockStatus === 'out_of_stock' || !product.isEnabled}
                  onClick={handleAddToCart}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {product.stockStatus === 'out_of_stock' ? "Out of Stock" : !product.isEnabled ? "Unavailable" : !user ? "Login to Order" : "Add to Cart"}
                </Button>
                {user && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      likeMutation.mutate();
                    }}
                    disabled={likeMutation.isPending}
                  >
                    <Heart className={`h-5 w-5 ${likeData?.liked ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                )}
              </div>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Check for new product notifications
  useEffect(() => {
    const checkNotification = () => {
      const notification = localStorage.getItem('newProductNotification');
      if (notification) {
        const data = JSON.parse(notification);
        const oneHour = 60 * 60 * 1000;
        
        if (Date.now() - data.timestamp < oneHour) {
          toast({
            title: "🎨 New Product Added!",
            description: (
              <div className="space-y-2">
                <p className="font-medium">{data.name}</p>
                <p className="text-sm text-muted-foreground">₹{data.price} • {data.category}</p>
                <Link href="/shop">
                  <button className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
                    Shop Now
                  </button>
                </Link>
              </div>
            ),
            duration: 5000,
          });
        }
        localStorage.removeItem('newProductNotification');
      }
    };
    
    checkNotification();
  }, [toast]);

  const filteredProducts = products?.filter((product) => {
    // Category filter
    if (selectedCategory !== "all" && product.category !== selectedCategory) {
      return false;
    }
    
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Price range filter
    if (priceRange !== "all") {
      const price = parseFloat(product.price);
      const finalPrice = product.discountPercent ? price * (1 - product.discountPercent / 100) : price;
      
      switch (priceRange) {
        case "0-500":
          if (finalPrice >= 500) return false;
          break;
        case "500-1000":
          if (finalPrice < 500 || finalPrice >= 1000) return false;
          break;
        case "1000-2500":
          if (finalPrice < 1000 || finalPrice >= 2500) return false;
          break;
        case "2500-5000":
          if (finalPrice < 2500 || finalPrice >= 5000) return false;
          break;
        case "5000+":
          if (finalPrice < 5000) return false;
          break;
      }
    }
    
    return true;
  })?.sort((a, b) => {
    const priceA = parseFloat(a.price) * (1 - (a.discountPercent || 0) / 100);
    const priceB = parseFloat(b.price) * (1 - (b.discountPercent || 0) / 100);
    
    switch (sortBy) {
      case "price-low":
        return priceA - priceB;
      case "price-high":
        return priceB - priceA;
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
        return b.id.localeCompare(a.id); // Assuming newer products have later IDs
      case "featured":
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

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
          
          {/* Search and Filters */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6 mt-6">
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Category</Label>
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <Button
                              key={category.value}
                              variant={selectedCategory === category.value ? "default" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => setSelectedCategory(category.value)}
                            >
                              {category.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Price Range</Label>
                        <Select value={priceRange} onValueChange={setPriceRange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priceRanges.map((range) => (
                              <SelectItem key={range.value} value={range.value}>
                                {range.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Active Filters */}
            <div className="flex flex-wrap gap-2">
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {categories.find(c => c.value === selectedCategory)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
                </Badge>
              )}
              {priceRange !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {priceRanges.find(p => p.value === priceRange)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setPriceRange("all")} />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchQuery}"
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                </Badge>
              )}
            </div>
          </div>

          {/* Results count */}
          {filteredProducts && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {products?.length || 0} products
              </p>

            </div>
          )}

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
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="font-display text-xl mb-2">
                {searchQuery || selectedCategory !== "all" || priceRange !== "all" 
                  ? "No products match your filters" 
                  : "No products yet"}
              </h3>
              <p>
                {searchQuery || selectedCategory !== "all" || priceRange !== "all"
                  ? "Try adjusting your search or filters"
                  : "Check back soon for our handmade collection"}
              </p>
              {(searchQuery || selectedCategory !== "all" || priceRange !== "all") && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setPriceRange("all");
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
