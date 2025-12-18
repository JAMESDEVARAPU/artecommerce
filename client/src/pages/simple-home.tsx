import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, UserPlus } from "lucide-react";

export default function SimpleHome() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-4xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">🎨 Artistry Studio</h1>
        <p className="text-xl text-gray-700 mb-12">Handmade Art & Creative Classes</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <User className="h-6 w-6" />
                User Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Browse products, shop, and register for classes</p>
              <Link href="/login">
                <Button className="w-full">
                  Login as User
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Shield className="h-6 w-6" />
                Admin Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage products, orders, classes, and workshops</p>
              <Link href="/admin-login">
                <Button variant="secondary" className="w-full">
                  Login as Admin
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <UserPlus className="h-6 w-6" />
                Create Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Join our creative community today</p>
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}