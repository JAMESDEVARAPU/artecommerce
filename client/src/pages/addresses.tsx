import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Plus, Trash2, Edit, Home, Building } from "lucide-react";

type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  type: "home" | "work" | "other";
};

export default function Addresses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    name: "",
    phone: "",
    address: "",
    type: "home" as "home" | "work" | "other"
  });

  useEffect(() => {
    if (user) {
      const savedAddresses = localStorage.getItem(`addresses_${user.username}`);
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
    }
  }, [user]);

  const saveAddresses = (newAddresses: Address[]) => {
    if (user) {
      localStorage.setItem(`addresses_${user.username}`, JSON.stringify(newAddresses));
      setAddresses(newAddresses);
    }
  };

  const addAddress = () => {
    if (!formData.label || !formData.name || !formData.address) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      ...formData
    };

    if (editingAddress) {
      const updated = addresses.map(addr => 
        addr.id === editingAddress.id ? { ...newAddress, id: editingAddress.id } : addr
      );
      saveAddresses(updated);
      toast({ title: "Address updated successfully" });
    } else {
      saveAddresses([...addresses, newAddress]);
      toast({ title: "Address added successfully" });
    }

    resetForm();
  };

  const deleteAddress = (id: string) => {
    const updated = addresses.filter(addr => addr.id !== id);
    saveAddresses(updated);
    toast({ title: "Address deleted" });
  };

  const editAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      name: address.name,
      phone: address.phone,
      address: address.address,
      type: address.type
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      label: "",
      name: "",
      phone: "",
      address: "",
      type: "home"
    });
    setEditingAddress(null);
    setIsDialogOpen(false);
  };

  if (!user) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display mb-2">Please login to view addresses</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl">Saved Addresses</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="label">Address Label *</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                    placeholder="e.g., Home, Office"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Complete Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter complete address with pincode"
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label>Address Type</Label>
                  <div className="flex gap-2 mt-2">
                    {[
                      { value: "home", label: "Home", icon: Home },
                      { value: "work", label: "Work", icon: Building },
                      { value: "other", label: "Other", icon: MapPin }
                    ].map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        variant={formData.type === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData({...formData, type: value as any})}
                      >
                        <Icon className="h-4 w-4 mr-1" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={addAddress} className="flex-1">
                    {editingAddress ? "Update Address" : "Add Address"}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {addresses.length > 0 ? (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <Card key={address.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {address.type === "home" && <Home className="h-4 w-4" />}
                        {address.type === "work" && <Building className="h-4 w-4" />}
                        {address.type === "other" && <MapPin className="h-4 w-4" />}
                        <h3 className="font-medium">{address.label}</h3>
                      </div>
                      <p className="font-medium">{address.name}</p>
                      {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
                      <p className="text-sm text-muted-foreground mt-1">{address.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => editAddress(address)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteAddress(address.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-display text-xl mb-2">No saved addresses</h3>
            <p className="text-muted-foreground mb-4">Add addresses for faster checkout</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}