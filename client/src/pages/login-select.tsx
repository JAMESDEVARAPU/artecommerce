import { Link } from "wouter";
import { User, Shield, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginSelect() {
  return (
    <main className="pt-24 min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5" data-testid="page-login-select">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-normal mb-4">
            🎨 Artistry Studio
          </h1>
          <p className="text-muted-foreground text-lg">
            Handmade Art &amp; Creative Classes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-display text-xl">User Login</CardTitle>
              <CardDescription>
                Browse products, shop, and register for classes
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/login">
                <Button className="w-full" data-testid="button-user-login">
                  Login as User
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
                <Shield className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="font-display text-xl">Admin Login</CardTitle>
              <CardDescription>
                Manage products, orders, classes, and workshops
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/admin-login">
                <Button variant="destructive" className="w-full" data-testid="button-admin-login">
                  Login as Admin
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-secondary/10 rounded-full w-fit">
                <UserPlus className="h-8 w-8 text-secondary-foreground" />
              </div>
              <CardTitle className="font-display text-xl">Create Account</CardTitle>
              <CardDescription>
                Join our creative community today
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/register">
                <Button variant="secondary" className="w-full" data-testid="button-sign-up">
                  Sign Up
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}