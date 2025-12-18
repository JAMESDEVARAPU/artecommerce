import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Lock, User, LogIn, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState(1);
  const { login, user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const sendOtp = async () => {
    if (!resetEmail) {
      toast({ title: "Enter email address", variant: "destructive" });
      return;
    }
    
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);
    toast({ title: `Your OTP: ${otpCode}` });
    setResetStep(2);
  };
  
  const verifyOtp = () => {
    if (otp === generatedOtp) {
      setResetStep(3);
      toast({ title: "OTP verified successfully" });
    } else {
      toast({ title: "Invalid OTP", variant: "destructive" });
    }
  };
  
  const resetPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    
    // Store new password (in real app, this would update the database)
    localStorage.setItem(`user_${resetEmail}_password`, newPassword);
    
    toast({ title: "Password reset successful" });
    setShowReset(false);
    setResetStep(1);
    setResetEmail("");
    setOtp("");
    setNewPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(username, password);
      toast({ title: "Login successful", description: "Welcome back!" });
      // Check if user is admin and redirect accordingly
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (response.ok) {
        const userData = await response.json();
        if (userData.isAdmin) {
          setLocation("/admin");
        } else {
          setLocation("/");
        }
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="pt-24 min-h-screen flex items-center justify-center" data-testid="page-login">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">Sign In</CardTitle>
          <CardDescription>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                  required
                  data-testid="input-username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                  data-testid="input-password"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                <button 
                  type="button"
                  onClick={() => setShowReset(true)}
                  className="text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </p>
              <p>
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
              <p>
                Admin?{" "}
                <Link href="/admin-login" className="text-primary hover:underline">
                  Admin Login
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Password Reset Dialog */}
      {showReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resetStep === 1 && (
                <>
                  <div>
                    <Label htmlFor="reset-email">Email Address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowReset(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={sendOtp} className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Send OTP
                    </Button>
                  </div>
                </>
              )}
              
              {resetStep === 2 && (
                <>
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setResetStep(1)} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button onClick={verifyOtp} className="flex-1">
                      Verify OTP
                    </Button>
                  </div>
                </>
              )}
              
              {resetStep === 3 && (
                <>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <Button onClick={resetPassword} className="w-full">
                    Reset Password
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
