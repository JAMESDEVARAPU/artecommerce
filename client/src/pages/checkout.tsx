import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, CreditCard, Smartphone, Wallet, Copy, QrCode } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import emailjs from '@emailjs/browser';

const paymentMethods = [
  {
    id: "phonepe",
    name: "PhonePe",
    icon: "📱",
    description: "Pay with PhonePe UPI",
    color: "bg-purple-100 text-purple-800"
  },
  {
    id: "googlepay",
    name: "Google Pay",
    icon: "🟢",
    description: "Pay with Google Pay",
    color: "bg-green-100 text-green-800"
  },
  {
    id: "paytm",
    name: "Paytm",
    icon: "💙",
    description: "Pay with Paytm Wallet",
    color: "bg-blue-100 text-blue-800"
  },
  {
    id: "upi",
    name: "UPI",
    icon: "🏦",
    description: "Pay with any UPI app",
    color: "bg-orange-100 text-orange-800"
  }
];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [selectedPayment, setSelectedPayment] = useState("");
  const [showUpiDetails, setShowUpiDetails] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    area: "",
    pincode: ""
  });
  
  const [paymentProof, setPaymentProof] = useState({
    transactionId: "",
    screenshot: ""
  });

  useEffect(() => {
    const settings = localStorage.getItem('paymentSettings');
    if (settings) {
      setPaymentSettings(JSON.parse(settings));
    }
  }, []);

  const sendAdminNotification = async (orderData) => {
    const itemsList = items.map(item => 
      `${item.productName} - Qty: ${item.quantity} - ₹${(parseFloat(item.price) * item.quantity).toFixed(2)}`
    ).join('\n');

    const emailParams = {
      to_email: 'admin@handmadebytejasree.com',
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone || 'Not provided',
      shipping_address: `${customerInfo.address}, ${customerInfo.area}, ${customerInfo.pincode}`,
      order_items: itemsList,
      total_amount: (totalPrice + 110).toFixed(2),
      transaction_id: paymentProof.transactionId
    };

    try {
      await emailjs.send(
        'service_handmade', // EmailJS service ID
        'template_order', // EmailJS template ID
        emailParams,
        'IxdirScLahCLlb5iQ' // EmailJS public key
      );
    } catch (error) {
      console.error('Failed to send admin notification:', error);
    }
  };

  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPayment) throw new Error("Please select a payment method");
      if (!customerInfo.name || !customerInfo.email || !customerInfo.address || !customerInfo.area || !customerInfo.pincode) {
        throw new Error("Please fill all required fields");
      }
      
      if (!paymentProof.screenshot || !paymentProof.transactionId) {
        throw new Error("Please provide both transaction ID and payment screenshot");
      }

      const orderData = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        shippingAddress: `${customerInfo.address}, ${customerInfo.area}, ${customerInfo.pincode}`,
        totalAmount: (totalPrice + 110).toFixed(2),
        paymentStatus: "pending",
        status: "new",
        transactionId: paymentProof.transactionId,
        paymentScreenshot: paymentProof.screenshot,
        items: items
      };

      const result = await apiRequest("POST", "/api/orders", orderData);
      
      // Send admin notification
      await sendAdminNotification(orderData);
      
      return result;
    },
    onSuccess: (orderData) => {
      // Save order to user's order history
      if (user) {
        const userOrders = JSON.parse(localStorage.getItem(`userOrders_${user.username}`) || '[]');
        const newOrder = {
          id: Date.now().toString(),
          ...orderData,
          items: items,
          createdAt: new Date().toISOString(),
          status: 'new'
        };
        userOrders.unshift(newOrder);
        localStorage.setItem(`userOrders_${user.username}`, JSON.stringify(userOrders));
      }
      
      toast({
        title: "Order placed successfully!",
        description: "You will receive a confirmation email shortly."
      });
      clearCart();
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Order failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  const handlePayment = () => {
    if (!selectedPayment) {
      toast({
        title: "Select payment method",
        description: "Please choose a payment option",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = (totalPrice + 110).toFixed(2);
    const upiId = paymentSettings?.upiId || "merchant@upi";
    const merchantName = "Handmade by Tejasree";
    
    let paymentUrl = "";
    
    switch (selectedPayment) {
      case "phonepe":
        paymentUrl = `phonepe://pay?pa=${upiId}&pn=${merchantName}&am=${totalAmount}&cu=INR`;
        break;
      case "googlepay":
        paymentUrl = `tez://upi/pay?pa=${upiId}&pn=${merchantName}&am=${totalAmount}&cu=INR`;
        break;
      case "paytm":
        paymentUrl = `paytmmp://pay?pa=${upiId}&pn=${merchantName}&am=${totalAmount}&cu=INR`;
        break;
      case "upi":
        paymentUrl = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${totalAmount}&cu=INR`;
        break;
    }

    if (paymentUrl) {
      try {
        window.open(paymentUrl, '_self');
      } catch (e) {
        toast({
          title: "Manual Payment Required",
          description: `Send ₹${totalAmount} to UPI ID: ${upiId}`,
          duration: 8000
        });
      }
      
      setTimeout(() => {
        toast({
          title: "Complete your payment",
          description: "After payment, click 'Confirm Order' below",
          duration: 5000
        });
      }, 2000);
    }
  };

  if (items.length === 0) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-display mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-4">Add some items to proceed to checkout</p>
          <Button onClick={() => setLocation("/shop")}>Continue Shopping</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-display text-3xl mb-8">Checkout</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="area">Area/Locality *</Label>
                    <Input
                      id="area"
                      value={customerInfo.area}
                      onChange={(e) => setCustomerInfo({...customerInfo, area: e.target.value})}
                      placeholder="Enter area/locality"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={customerInfo.pincode}
                      onChange={(e) => setCustomerInfo({...customerInfo, pincode: e.target.value})}
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    placeholder="House/Flat No., Street, Landmark"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id}>
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPayment === method.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        setSelectedPayment(method.id);
                        setShowUpiDetails(method.id === "upi" || method.id === "phonepe" || method.id === "googlepay" || method.id === "paytm");
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{method.icon}</span>
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={method.color}>Popular</Badge>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedPayment === method.id 
                              ? "border-primary bg-primary" 
                              : "border-muted-foreground"
                          }`}>
                            {selectedPayment === method.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* UPI Payment Details */}
                    {selectedPayment === method.id && showUpiDetails && paymentSettings && (
                      <Card className="mt-4 p-4 bg-muted/50">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <QrCode className="h-4 w-4" />
                          Payment Details
                        </h4>
                        
                        {paymentSettings.upiId && (
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground mb-1">UPI ID</p>
                            <div className="flex items-center gap-2">
                              <code className="bg-background px-2 py-1 rounded text-sm">{paymentSettings.upiId}</code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(paymentSettings.upiId);
                                  toast({ title: "UPI ID copied!" });
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {paymentSettings.qrCode && (
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground mb-2">Scan QR Code</p>
                            <img src={paymentSettings.qrCode} alt="UPI QR Code" className="w-32 h-32 object-cover rounded border" />
                          </div>
                        )}
                        
                        {paymentSettings.bankName && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Bank Details</p>
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">Bank:</span> {paymentSettings.bankName}</p>
                              <p><span className="font-medium">Account:</span> {paymentSettings.accountNumber}</p>
                              <p><span className="font-medium">IFSC:</span> {paymentSettings.ifscCode}</p>
                              <p><span className="font-medium">Name:</span> {paymentSettings.accountHolder}</p>
                            </div>
                          </div>
                        )}
                      </Card>
                    )}
                  </div>
                ))}

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Delivery</span>
                    <span>₹110.00</span>
                  </div>

                  <Separator />
                  <div className="flex items-center justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{(totalPrice + 110).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePayment}
                    disabled={orderMutation.isPending || !selectedPayment}
                  >
                    {orderMutation.isPending ? "Processing..." : `Open ${paymentMethods.find(p => p.id === selectedPayment)?.name || 'Payment App'}`}
                  </Button>
                  
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium">Payment Verification</h4>
                    <div>
                      <Label htmlFor="transactionId">Transaction ID *</Label>
                      <Input
                        id="transactionId"
                        value={paymentProof.transactionId}
                        onChange={(e) => setPaymentProof({...paymentProof, transactionId: e.target.value})}
                        placeholder="Enter transaction/reference ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="screenshot">Payment Screenshot *</Label>
                      <Input
                        id="screenshot"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setPaymentProof({...paymentProof, screenshot: reader.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    {paymentProof.screenshot && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Screenshot Preview:</p>
                        <img src={paymentProof.screenshot} alt="Payment screenshot" className="w-32 h-32 object-cover rounded border" />
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    size="lg"
                    onClick={() => orderMutation.mutate()}
                    disabled={orderMutation.isPending || !selectedPayment || !paymentProof.screenshot || !paymentProof.transactionId}
                  >
                    Confirm Order (Payment Done)
                  </Button>
                </div>

                {showUpiDetails && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      💡 <strong>Payment Instructions:</strong> Transfer ₹{(totalPrice + 110).toFixed(2)} to the above details and click "Pay" to confirm your order.
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Your payment information is secure and encrypted
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}