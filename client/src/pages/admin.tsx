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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import type { Product, Order, ArtClass, Workshop, Contact } from "@shared/schema";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description required"),
  price: z.string().min(1, "Price is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{classes?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Active Classes</p>
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
              <p className="text-2xl font-semibold">${totalRevenue.toFixed(0)}</p>
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
      category: "decor",
      imageUrl: "",
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
    onSuccess: () => {
      toast({ title: "Product created successfully" });
      setShowForm(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
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
        <Button onClick={() => setShowForm(true)} data-testid="button-add-product">
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
                <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant={product.stockStatus === 'available' ? "default" : product.stockStatus === 'limited' ? "destructive" : "secondary"}>
                      {product.stockStatus === 'available' ? "Available" : product.stockStatus === 'limited' ? "Limited" : "Out of Stock"}
                    </Badge>
                    {!product.isEnabled && <Badge variant="outline">Disabled</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(product.id)}
                    data-testid={`button-delete-product-${product.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
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
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-product-image" />
                    </FormControl>
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
                disabled={createMutation.isPending}
                data-testid="button-save-product"
              >
                {createMutation.isPending ? "Saving..." : "Save Product"}
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/orders/${id}`, { status });
    },
    onSuccess: () => {
      toast({ title: "Order updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });

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
                <TableCell>${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
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
                  <Select
                    value={order.status || "new"}
                    onValueChange={(value) =>
                      updateMutation.mutate({ id: order.id, status: value })
                    }
                  >
                    <SelectTrigger className="h-8" data-testid={`select-order-status-${order.id}`}>
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
                <TableCell>${parseFloat(cls.price).toFixed(2)}</TableCell>
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
  const { data: workshops, isLoading } = useQuery<Workshop[]>({
    queryKey: ["/api/workshops"],
  });
  const { toast } = useToast();
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
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/workshops", {
        ...data,
        price: data.price,
        maxSeats: parseInt(data.maxSeats),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshops"] });
      toast({ title: "Workshop created successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create workshop", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      await apiRequest("PUT", `/api/workshops/${id}`, {
        ...data,
        price: data.price,
        maxSeats: parseInt(data.maxSeats),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshops"] });
      toast({ title: "Workshop updated successfully" });
      resetForm();
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
      queryClient.invalidateQueries({ queryKey: ["/api/workshops"] });
      toast({ title: "Workshop deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete workshop", variant: "destructive" });
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

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : workshops && workshops.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workshop</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Booked</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workshops.map((workshop) => (
              <TableRow key={workshop.id} data-testid={`row-workshop-${workshop.id}`}>
                <TableCell>
                  <div>
                    <p className="font-medium">{workshop.title}</p>
                    <p className="text-sm text-muted-foreground">{workshop.duration}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p>{format(new Date(workshop.date), "MMM d, yyyy")}</p>
                    <p className="text-sm text-muted-foreground">{workshop.time}</p>
                  </div>
                </TableCell>
                <TableCell>${parseFloat(workshop.price).toFixed(2)}</TableCell>
                <TableCell>
                  {workshop.bookedSeats || 0} / {workshop.maxSeats}
                </TableCell>
                <TableCell>
                  <Badge variant={workshop.isPast ? "secondary" : "default"}>
                    {workshop.isPast ? "Completed" : "Upcoming"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(workshop)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(workshop.id)}>
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
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No workshops yet</p>
        </div>
      )}
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
    <main className="pt-24" data-testid="page-admin">
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
                  <TabsTrigger value="classes" data-testid="tab-admin-classes">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Classes
                  </TabsTrigger>
                  <TabsTrigger value="workshops" data-testid="tab-admin-workshops">
                    <Calendar className="h-4 w-4 mr-2" />
                    Workshops
                  </TabsTrigger>
                  <TabsTrigger value="messages" data-testid="tab-admin-messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="products">
                  <ProductsTab />
                </TabsContent>
                <TabsContent value="orders">
                  <OrdersTab />
                </TabsContent>
                <TabsContent value="classes">
                  <ClassRegistrationsTab />
                </TabsContent>
                <TabsContent value="workshops">
                  <WorkshopBookingsTab />
                </TabsContent>
                <TabsContent value="messages">
                  <MessagesTab />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
