import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Package,
  ShoppingCart,
  GraduationCap,
  Calendar,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Eye,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import type { Product, Order, ArtClass, Workshop, Contact } from "@/types";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description required"),
  price: z.string().min(1, "Price is required"),
  discountPercent: z.number().min(0).max(100).default(0),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().min(1, "At least one image is required"),
  additionalImages: z.array(z.string()).default([]),
  videoUrl: z.string().optional(),
  stockQuantity: z.number().min(0).default(0),
  stockStatus: z.string().default("available"),
  isEnabled: z.boolean().default(true),
  isCustomizable: z.boolean().default(false),
  featured: z.boolean().default(false),
});

type ProductForm = z.infer<typeof productSchema>;

function StatsCards() {
  const { data: products } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: orders } = useQuery<Order[]>({ queryKey: ["/api/orders"] });
  const { data: classes } = useQuery<ArtClass[]>({ queryKey: ["/api/classes"] });
  const { data: workshops } = useQuery<Workshop[]>({ queryKey: ["/api/workshops"] });

  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0) || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{products?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{pendingOrders}</p>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">₹{totalRevenue.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      discountPercent: 0,
      category: "decor",
      imageUrl: "",
      additionalImages: [],
      videoUrl: "",
      stockQuantity: 0,
      stockStatus: "available",
      isEnabled: true,
      isCustomizable: false,
      featured: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response;
    },
    onSuccess: (response) => {
      const productData = form.getValues();
      
      // Store notification for users
      localStorage.setItem('newProductNotification', JSON.stringify({
        name: productData.name,
        price: productData.price,
        category: productData.category,
        timestamp: Date.now()
      }));
      
      toast({ title: "Product created successfully" });
      setShowForm(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      if (!editingProduct) throw new Error("No product selected for editing");
      const response = await apiRequest("PATCH", `/api/products/${editingProduct.id}`, data);
      return response;
    },
    onSuccess: () => {
      toast({ title: "Product updated successfully" });
      setShowForm(false);
      setEditingProduct(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Product deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-lg">Products</h3>
        <Button onClick={() => {
          setEditingProduct(null);
          form.reset();
          setShowForm(true);
        }} data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="capitalize">{product.category}</TableCell>
                <TableCell>₹{parseFloat(product.price).toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant={product.stockStatus === 'available' ? "default" : product.stockStatus === 'limited' ? "destructive" : "secondary"}>
                      {product.stockStatus === 'available' ? "Available" : product.stockStatus === 'limited' ? "Limited" : "Out of Stock"}
                    </Badge>
                    {!product.isEnabled && <Badge variant="outline">Disabled</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        form.reset({
                          name: product.name,
                          description: product.description,
                          price: product.price,
                          discountPercent: product.discountPercent || 0,
                          category: product.category,
                          imageUrl: product.imageUrl || "",
                          additionalImages: Array.isArray(product.additionalImages) ? product.additionalImages : [],
                          videoUrl: product.videoUrl || "",
                          stockQuantity: product.stockQuantity || 0,
                          stockStatus: product.stockStatus || "available",
                          isEnabled: product.isEnabled ?? true,
                          isCustomizable: product.isCustomizable ?? false,
                          featured: product.featured ?? false,
                        });
                        setEditingProduct(product);
                        setShowForm(true);
                      }}
                      data-testid={`button-edit-product-${product.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(product.id)}
                      data-testid={`button-delete-product-${product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No products yet</p>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                // Ensure additionalImages is properly formatted
                const formattedData = {
                  ...data,
                  additionalImages: data.additionalImages || []
                };
                if (editingProduct) {
                  updateMutation.mutate(formattedData);
                } else {
                  createMutation.mutate(formattedData);
                }
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-product-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-product-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} data-testid="input-product-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount %</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-discount" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-product-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="decor">Home Décor</SelectItem>
                        <SelectItem value="gifts">Gifts</SelectItem>
                        <SelectItem value="paintings">Paintings</SelectItem>
                        <SelectItem value="crafts">Crafts</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Product Image</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              field.onChange(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        data-testid="input-product-image" 
                      />
                    </FormControl>
                    {field.value && (
                      <img src={field.value} alt="Main product" className="w-full h-32 object-cover rounded mt-2" />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalImages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Images (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            const readers = files.map(file => {
                              return new Promise<string>((resolve) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result as string);
                                reader.readAsDataURL(file);
                              });
                            });
                            Promise.all(readers).then(results => {
                              // Combine with existing images if any
                              const existingImages = field.value || [];
                              field.onChange([...existingImages, ...results]);
                            });
                          }
                        }}
                        data-testid="input-additional-images" 
                      />
                    </FormControl>
                    {field.value && Array.isArray(field.value) && field.value.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {field.value.map((img, index) => (
                          <div key={index} className="relative">
                            <img src={img} alt={`Additional ${index + 1}`} className="w-full h-20 object-cover rounded" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => {
                                const newImages = field.value.filter((_, i) => i !== index);
                                field.onChange(newImages);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Video (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              field.onChange(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        data-testid="input-product-video" 
                      />
                    </FormControl>
                    {field.value && (
                      <video src={field.value} className="w-full h-32 object-cover rounded mt-2" controls />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-stock-quantity" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stockStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-stock-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="limited">Limited Stock</SelectItem>
                          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <FormField
                  control={form.control}
                  name="isEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-enabled"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Enabled</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-featured"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Featured</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isCustomizable"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-customizable"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Customizable</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-product"
              >
                {(createMutation.isPending || updateMutation.isPending) 
                  ? "Saving..." 
                  : editingProduct ? "Update Product" : "Save Product"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState([]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/orders/${id}`, { status });
    },
    onSuccess: () => {
      toast({ title: "Order updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });

  const viewOrderDetails = async (order: Order) => {
    try {
      const response = await apiRequest("GET", `/api/orders/${order.id}`);
      setSelectedOrder(response);
      setOrderItems(response.items || []);
    } catch (error) {
      toast({ title: "Failed to load order details", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "secondary";
      case "in_progress":
        return "default";
      case "completed":
        return "default";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div>
      <h3 className="font-display text-lg mb-4">Orders</h3>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                  </div>
                </TableCell>
                <TableCell>₹{parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {order.isCustomOrder ? "Custom" : "Standard"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(order.status || "new")}>
                    {order.status === 'new' ? 'New' : order.status === 'in_progress' ? 'In Progress' : order.status === 'completed' ? 'Completed' : order.status === 'delivered' ? 'Delivered' : order.status === 'cancelled' ? 'Cancelled' : order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Select
                      value={order.status || "new"}
                      onValueChange={(value) =>
                        updateMutation.mutate({ id: order.id, status: value })
                      }
                    >
                      <SelectTrigger className="h-8 w-32" data-testid={`select-order-status-${order.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No orders yet</p>
        </div>
      )}
      
      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order ID: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h4 className="font-medium mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedOrder.customerEmail}</p>
                  </div>
                  {selectedOrder.customerPhone && (
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedOrder.customerPhone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-medium">
                      {selectedOrder.createdAt ? format(new Date(selectedOrder.createdAt), "MMM d, yyyy 'at' h:mm a") : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Delivery Address */}
              <div>
                <h4 className="font-medium mb-3">Delivery Address</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedOrder.shippingAddress}</p>
                </div>
              </div>
              
              {/* Order Items */}
              {orderItems.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {orderItems.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Custom Order Details */}
              {selectedOrder.isCustomOrder && selectedOrder.customOrderDetails && (
                <div>
                  <h4 className="font-medium mb-3">Custom Order Details</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedOrder.customOrderDetails}</p>
                  </div>
                </div>
              )}
              
              {/* Order Summary */}
              <div>
                <h4 className="font-medium mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order Type:</span>
                    <Badge variant="outline">
                      {selectedOrder.isCustomOrder ? "Custom Order" : "Standard Order"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <Badge variant={selectedOrder.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                      {selectedOrder.paymentStatus || 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total Amount:</span>
                    <span>₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClassRegistrationsTab() {
  const { data: classes, isLoading: classesLoading } = useQuery<ArtClass[]>({
    queryKey: ["/api/classes"],
  });
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ArtClass | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    schedule: "",
    price: "",
    maxStudents: "10",
    level: "beginner",
    isActive: true,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/classes", {
        ...data,
        price: data.price,
        maxStudents: parseInt(data.maxStudents),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({ title: "Class created successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create class", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      await apiRequest("PUT", `/api/classes/${id}`, {
        ...data,
        price: data.price,
        maxStudents: parseInt(data.maxStudents),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({ title: "Class updated successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update class", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({ title: "Class deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete class", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      schedule: "",
      price: "",
      maxStudents: "10",
      level: "beginner",
      isActive: true,
    });
    setEditingClass(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (cls: ArtClass) => {
    setEditingClass(cls);
    setFormData({
      title: cls.title,
      description: cls.description || "",
      schedule: cls.schedule,
      price: cls.price,
      maxStudents: String(cls.maxStudents || 10),
      level: cls.level || "beginner",
      isActive: cls.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateMutation.mutate({ id: editingClass.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-lg">Classes</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} data-testid="button-add-class">
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingClass ? "Edit Class" : "Add New Class"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="class-title">Title</Label>
                <Input
                  id="class-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="class-description">Description</Label>
                <Textarea
                  id="class-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="class-schedule">Schedule</Label>
                <Input
                  id="class-schedule"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="e.g., Tuesdays 6-8 PM"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class-price">Price</Label>
                  <Input
                    id="class-price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="class-max">Max Students</Label>
                  <Input
                    id="class-max"
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="class-level">Level</Label>
                <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="class-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Label htmlFor="class-active">Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingClass ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {classesLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : classes && classes.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((cls) => (
              <TableRow key={cls.id} data-testid={`row-class-${cls.id}`}>
                <TableCell>
                  <div>
                    <p className="font-medium">{cls.title}</p>
                    <p className="text-sm text-muted-foreground capitalize">{cls.level}</p>
                  </div>
                </TableCell>
                <TableCell>{cls.schedule}</TableCell>
                <TableCell>₹{parseFloat(cls.price).toFixed(2)}</TableCell>
                <TableCell>
                  {cls.enrolledCount || 0} / {cls.maxStudents || 10}
                </TableCell>
                <TableCell>
                  <Badge variant={cls.isActive ? "default" : "secondary"}>
                    {cls.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(cls)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(cls.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No classes yet</p>
        </div>
      )}
    </div>
  );
}

function WorkshopBookingsTab() {
  const { toast } = useToast();
  const [workshops, setWorkshops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        console.log('Fetching workshops...');
        const response = await apiRequest("GET", "/api/workshops");
        console.log('Workshops response:', response);
        setWorkshops(response || []);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch workshops:', error);
        setError(error.message || 'Failed to load workshops');
        setWorkshops([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkshops();
  }, []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "",
    price: "",
    maxSeats: "12",
    materialsIncluded: true,
    location: "",
    requirements: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!data.title || !data.description || !data.date || !data.time || !data.duration || !data.location || !data.price || !data.maxSeats) {
        throw new Error('All fields are required');
      }
      
      const payload = {
        title: data.title.trim(),
        description: data.description.trim(),
        date: new Date(data.date + 'T' + data.time).getTime(),
        time: data.time,
        duration: data.duration.trim(),
        venue: data.location.trim(),
        price: data.price,
        maxSeats: parseInt(data.maxSeats) || 1,
      };
      console.log('Sending workshop data:', payload);
      await apiRequest("POST", "/api/workshops", payload);
    },
    onSuccess: () => {
      toast({ title: "Workshop created successfully" });
      resetForm();
      // Refresh workshops list
      const fetchWorkshops = async () => {
        const response = await apiRequest("GET", "/api/workshops");
        setWorkshops(response || []);
      };
      fetchWorkshops();
    },
    onError: (error) => {
      console.error('Workshop creation error:', error);
      toast({ title: "Failed to create workshop", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      await apiRequest("PUT", `/api/workshops/${id}`, {
        title: data.title,
        description: data.description,
        date: new Date(data.date).getTime(),
        time: data.time,
        duration: data.duration,
        venue: data.location,
        price: data.price,
        maxSeats: parseInt(data.maxSeats),
      });
    },
    onSuccess: () => {
      toast({ title: "Workshop updated successfully" });
      resetForm();
      // Refresh workshops list
      const fetchWorkshops = async () => {
        const response = await apiRequest("GET", "/api/workshops");
        setWorkshops(response || []);
      };
      fetchWorkshops();
    },
    onError: () => {
      toast({ title: "Failed to update workshop", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/workshops/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Workshop deleted successfully" });
      // Refresh workshops list
      const fetchWorkshops = async () => {
        const response = await apiRequest("GET", "/api/workshops");
        setWorkshops(response || []);
      };
      fetchWorkshops();
    },
    onError: () => {
      toast({ title: "Failed to delete workshop", variant: "destructive" });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/workshops");
    },
    onSuccess: () => {
      toast({ title: "All workshops cleared" });
      setWorkshops([]);
    },
    onError: () => {
      toast({ title: "Failed to clear workshops", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      duration: "",
      price: "",
      maxSeats: "12",
      materialsIncluded: true,
      location: "",
      requirements: "",
    });
    setEditingWorkshop(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      title: workshop.title,
      description: workshop.description || "",
      date: workshop.date,
      time: workshop.time || "",
      duration: workshop.duration || "",
      price: workshop.price,
      maxSeats: String(workshop.maxSeats),
      materialsIncluded: workshop.materialsIncluded ?? true,
      location: workshop.venue || "",
      requirements: workshop.requirements || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorkshop) {
      updateMutation.mutate({ id: editingWorkshop.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-lg">Workshops</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              if (workshops && workshops.length > 0 && confirm('Clear all workshops?')) {
                clearAllMutation.mutate();
              } else if (!workshops || workshops.length === 0) {
                alert('No workshops to clear');
              }
            }}
            data-testid="button-clear-workshops"
          >
            Clear All
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} data-testid="button-add-workshop">
              <Plus className="h-4 w-4 mr-2" />
              Add Workshop
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingWorkshop ? "Edit Workshop" : "Add New Workshop"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="workshop-title">Title</Label>
                <Input
                  id="workshop-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="workshop-description">Description</Label>
                <Textarea
                  id="workshop-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workshop-date">Date</Label>
                  <Input
                    id="workshop-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="workshop-time">Time</Label>
                  <Input
                    id="workshop-time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workshop-duration">Duration</Label>
                  <Input
                    id="workshop-duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 3 hours"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="workshop-max">Max Seats</Label>
                  <Input
                    id="workshop-max"
                    type="number"
                    value={formData.maxSeats}
                    onChange={(e) => setFormData({ ...formData, maxSeats: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="workshop-price">Price</Label>
                <Input
                  id="workshop-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="workshop-location">Location</Label>
                <Input
                  id="workshop-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Workshop venue/location"
                  required
                />
              </div>
              <div>
                <Label htmlFor="workshop-requirements">Requirements</Label>
                <Textarea
                  id="workshop-requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="What participants need to bring or know"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="workshop-materials"
                  checked={formData.materialsIncluded}
                  onChange={(e) => setFormData({ ...formData, materialsIncluded: e.target.checked })}
                />
                <Label htmlFor="workshop-materials">Materials Included</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingWorkshop ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {error && (
        <div className="text-center py-8 text-red-500">
          <p>Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">Retry</Button>
        </div>
      )}
      
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : workshops && workshops.length > 0 ? (
        <div className="space-y-4">
          {workshops.map((workshop) => (
            <Card key={workshop.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-lg">{workshop.title}</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(workshop)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(workshop.id)}>Delete</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">{new Date(workshop.date).toLocaleDateString()}</p>
                  <p className="text-sm">{workshop.time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{workshop.venue}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entry Price</p>
                  <p className="font-medium text-primary">₹{workshop.price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seats Available</p>
                  <p className="font-medium">{(workshop.maxSeats - (workshop.bookedSeats || 0))} / {workshop.maxSeats}</p>
                </div>
              </div>
              
              {workshop.description && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{workshop.description}</p>
                </div>
              )}
              
              {workshop.requirements && (
                <div>
                  <p className="text-sm text-muted-foreground">Requirements</p>
                  <p className="text-sm">{workshop.requirements}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No workshops yet</p>
        </div>
      )}
    </div>
  );
}

function GalleryTab() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const { toast } = useToast();
  const { data: galleryItems, isLoading } = useQuery({
    queryKey: ["/api/gallery"],
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!imageFile || !title) throw new Error("Missing data");
      
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const response = await apiRequest("POST", "/api/gallery", {
              title,
              imageUrl: reader.result,
              category: "art",
              isFeatured: false
            });
            resolve(response);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Image uploaded successfully" });
      setImageFile(null);
      setTitle("");
    },
    onError: () => {
      toast({ title: "Upload failed", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/gallery/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      queryClient.refetchQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Image deleted" });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({ title: "Delete failed", variant: "destructive" });
    },
  });

  return (
    <div>
      <h3 className="font-display text-lg mb-4">Gallery</h3>
      
      <Card className="p-4 mb-6">
        <h4 className="font-medium mb-3">Upload New Image</h4>
        <div className="space-y-3">
          <Input
            placeholder="Image title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <Button 
            onClick={() => uploadMutation.mutate()}
            disabled={!imageFile || !title || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : galleryItems?.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {galleryItems.map((item: any) => (
            <div key={item.id} className="relative">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full aspect-square object-cover rounded"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  if (confirm('Delete this image?')) {
                    deleteMutation.mutate(item.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <p className="mt-1 text-sm font-medium">{item.title}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-8 text-muted-foreground">No images uploaded yet</p>
      )}
    </div>
  );
}

function PaymentSettingsTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    upiId: "",
    qrCode: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolder: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem('paymentSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('paymentSettings', JSON.stringify(settings));
    toast({ title: "Payment settings saved" });
  };

  return (
    <div className="space-y-6">
      <h3 className="font-display text-lg">Payment Settings</h3>
      
      <Card>
        <CardHeader>
          <CardTitle>UPI Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="upi-id">UPI ID</Label>
            <Input
              id="upi-id"
              value={settings.upiId}
              onChange={(e) => setSettings({...settings, upiId: e.target.value})}
              placeholder="yourname@paytm"
            />
          </div>
          <div>
            <Label htmlFor="qr-code">UPI QR Code</Label>
            <Input
              id="qr-code"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setSettings({...settings, qrCode: reader.result as string});
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {settings.qrCode && (
              <div className="mt-2">
                <img src={settings.qrCode} alt="UPI QR Code" className="w-32 h-32 object-cover rounded" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input
                id="bank-name"
                value={settings.bankName}
                onChange={(e) => setSettings({...settings, bankName: e.target.value})}
                placeholder="State Bank of India"
              />
            </div>
            <div>
              <Label htmlFor="account-holder">Account Holder Name</Label>
              <Input
                id="account-holder"
                value={settings.accountHolder}
                onChange={(e) => setSettings({...settings, accountHolder: e.target.value})}
                placeholder="John Doe"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                value={settings.accountNumber}
                onChange={(e) => setSettings({...settings, accountNumber: e.target.value})}
                placeholder="1234567890"
              />
            </div>
            <div>
              <Label htmlFor="ifsc-code">IFSC Code</Label>
              <Input
                id="ifsc-code"
                value={settings.ifscCode}
                onChange={(e) => setSettings({...settings, ifscCode: e.target.value})}
                placeholder="SBIN0001234"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveSettings} className="w-full">
        Save Payment Settings
      </Button>
    </div>
  );
}

function MessagesTab() {
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/contacts/${id}`, { isRead: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
  });

  return (
    <div>
      <h3 className="font-display text-lg mb-4">Contact Messages</h3>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : contacts && contacts.length > 0 ? (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <Card
              key={contact.id}
              className={contact.isRead ? "opacity-70" : ""}
              data-testid={`card-message-${contact.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{contact.name}</p>
                      {!contact.isRead && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {contact.email}
                      {contact.subject && ` • ${contact.subject}`}
                    </p>
                    <p className="text-sm">{contact.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-muted-foreground">
                      {contact.createdAt
                        ? format(new Date(contact.createdAt), "MMM d")
                        : ""}
                    </span>
                    {!contact.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateMutation.mutate(contact.id)}
                        data-testid={`button-mark-read-${contact.id}`}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No messages yet</p>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { user, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      setLocation("/login");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </main>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <main className="pt-24 min-h-screen bg-background" data-testid="page-admin">
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-normal">
              Admin Dashboard
            </h1>
            <Button variant="outline" onClick={() => logout().then(() => setLocation("/"))} data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <StatsCards />

          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="products">
                <TabsList className="mb-6">
                  <TabsTrigger value="products" data-testid="tab-admin-products">
                    <Package className="h-4 w-4 mr-2" />
                    Products
                  </TabsTrigger>
                  <TabsTrigger value="orders" data-testid="tab-admin-orders">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="workshops" data-testid="tab-admin-workshops">
                    <Calendar className="h-4 w-4 mr-2" />
                    Workshops
                  </TabsTrigger>
                  <TabsTrigger value="gallery" data-testid="tab-admin-gallery">
                    <Eye className="h-4 w-4 mr-2" />
                    Gallery
                  </TabsTrigger>
                  <TabsTrigger value="messages" data-testid="tab-admin-messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </TabsTrigger>
                  <TabsTrigger value="settings" data-testid="tab-admin-settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Payment Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="products">
                  <ProductsTab />
                </TabsContent>
                <TabsContent value="orders">
                  <OrdersTab />
                </TabsContent>
                <TabsContent value="workshops">
                  <WorkshopBookingsTab />
                </TabsContent>
                <TabsContent value="gallery">
                  <GalleryTab />
                </TabsContent>
                <TabsContent value="messages">
                  <MessagesTab />
                </TabsContent>
                <TabsContent value="settings">
                  <PaymentSettingsTab />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
