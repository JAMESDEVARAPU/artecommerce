import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { sendOTP } from './email.js';
import {
  insertProductSchema,
  insertOrderSchema,
  insertClassRegistrationSchema,
  insertWorkshopBookingSchema,
  insertTestimonialSchema,
  insertContactSchema,
  insertGalleryItemSchema,
  insertArtClassSchema,
  insertWorkshopSchema,
} from "@shared/schema-sqlite";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId || !req.session.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashedPassword, isAdmin: false });

      req.session.userId = user.id;
      req.session.isAdmin = false;

      res.status(201).json({ id: user.id, username: user.username, isAdmin: false });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin || false;

      res.json({ 
        id: user.id, 
        username: user.username, 
        isAdmin: user.isAdmin 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({ 
      userId: req.session.userId, 
      isAdmin: req.session.isAdmin 
    });
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const parsed = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(parsed);
      res.status(201).json(product);
    } catch (error) {
      console.error("Product creation error:", error);
      res.status(400).json({ error: "Invalid product data", details: error.message });
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Orders
  app.get("/api/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const items = await storage.getOrderItems(req.params.id);
      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { items, ...orderData } = req.body;
      const parsed = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(parsed);

      // Create order items if provided
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          });
        }
      }



      res.status(201).json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.patch("/api/orders/:id", requireAdmin, async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // Art Classes
  app.get("/api/classes", async (req, res) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch classes" });
    }
  });

  app.get("/api/classes/:id", async (req, res) => {
    try {
      const artClass = await storage.getClass(req.params.id);
      if (!artClass) {
        return res.status(404).json({ error: "Class not found" });
      }
      res.json(artClass);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch class" });
    }
  });

  app.post("/api/classes", requireAdmin, async (req, res) => {
    try {
      const parsed = insertArtClassSchema.parse(req.body);
      const artClass = await storage.createClass(parsed);
      res.status(201).json(artClass);
    } catch (error) {
      res.status(400).json({ error: "Invalid class data" });
    }
  });

  app.patch("/api/classes/:id", requireAdmin, async (req, res) => {
    try {
      const artClass = await storage.updateClass(req.params.id, req.body);
      if (!artClass) {
        return res.status(404).json({ error: "Class not found" });
      }
      res.json(artClass);
    } catch (error) {
      res.status(500).json({ error: "Failed to update class" });
    }
  });

  app.delete("/api/classes/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteClass(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete class" });
    }
  });

  // Class Registrations
  app.get("/api/class-registrations", requireAdmin, async (req, res) => {
    try {
      const classId = req.query.classId as string | undefined;
      const registrations = await storage.getClassRegistrations(classId);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  app.post("/api/class-registrations", async (req, res) => {
    try {
      const parsed = insertClassRegistrationSchema.parse(req.body);
      const registration = await storage.createClassRegistration(parsed);
      res.status(201).json(registration);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Invalid registration data" });
    }
  });

  // Workshops
  app.get("/api/workshops", async (req, res) => {
    try {
      const workshops = await storage.getWorkshops();
      res.json(workshops);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workshops" });
    }
  });

  app.get("/api/workshops/:id", async (req, res) => {
    try {
      const workshop = await storage.getWorkshop(req.params.id);
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }
      res.json(workshop);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workshop" });
    }
  });

  app.post("/api/workshops", requireAdmin, async (req, res) => {
    try {
      console.log('Workshop creation request body:', JSON.stringify(req.body, null, 2));
      const parsed = insertWorkshopSchema.parse(req.body);
      console.log('Parsed workshop data:', JSON.stringify(parsed, null, 2));
      const workshop = await storage.createWorkshop(parsed);
      res.status(201).json(workshop);
    } catch (error) {
      console.error('Workshop creation error:', error);
      if (error.issues) {
        console.error('Validation issues:', JSON.stringify(error.issues, null, 2));
      }
      res.status(400).json({ error: "Invalid workshop data", details: error.message, issues: error.issues });
    }
  });

  app.patch("/api/workshops/:id", requireAdmin, async (req, res) => {
    try {
      const workshop = await storage.updateWorkshop(req.params.id, req.body);
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }
      res.json(workshop);
    } catch (error) {
      res.status(500).json({ error: "Failed to update workshop" });
    }
  });

  app.delete("/api/workshops/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteWorkshop(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workshop" });
    }
  });

  app.delete("/api/workshops", requireAdmin, async (req, res) => {
    try {
      await storage.clearAllWorkshops();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear workshops" });
    }
  });

  // Workshop Bookings
  app.get("/api/workshop-bookings", requireAdmin, async (req, res) => {
    try {
      const workshopId = req.query.workshopId as string | undefined;
      const bookings = await storage.getWorkshopBookings(workshopId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.post("/api/workshop-bookings", async (req, res) => {
    try {
      const parsed = insertWorkshopBookingSchema.parse(req.body);
      const booking = await storage.createWorkshopBooking(parsed);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Booking error:", error);
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  // Testimonials
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.post("/api/testimonials", async (req, res) => {
    try {
      const parsed = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(parsed);
      res.status(201).json(testimonial);
    } catch (error) {
      res.status(400).json({ error: "Invalid testimonial data" });
    }
  });

  // Contacts
  app.get("/api/contacts", requireAdmin, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const parsed = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(parsed);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Contact creation error:", error);
      res.status(400).json({ error: "Invalid contact data" });
    }
  });

  app.patch("/api/contacts/:id", requireAdmin, async (req, res) => {
    try {
      const contact = await storage.updateContact(req.params.id, req.body);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  // Gallery
  app.get("/api/gallery", async (req, res) => {
    try {
      const items = await storage.getGalleryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery items" });
    }
  });

  app.post("/api/gallery", requireAdmin, async (req, res) => {
    try {
      const parsed = insertGalleryItemSchema.parse(req.body);
      const item = await storage.createGalleryItem(parsed);
      res.status(201).json(item);
    } catch (error) {
      console.error("Gallery creation error:", error);
      res.status(400).json({ error: "Invalid gallery item data" });
    }
  });

  app.delete("/api/gallery/:id", requireAdmin, async (req, res) => {
    try {
      console.log('Deleting gallery item:', req.params.id);
      await storage.deleteGalleryItem(req.params.id);
      console.log('Gallery item deleted successfully');
      res.status(204).send();
    } catch (error) {
      console.error('Gallery delete error:', error);
      res.status(500).json({ error: "Failed to delete gallery item" });
    }
  });

  // Test email route
  app.get("/api/test-email", async (req, res) => {
    try {
      console.log('Testing email with config:', {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS ? 'SET' : 'NOT SET'
      });
      await sendOTP('devarapujames@gmail.com', '123456');
      res.json({ success: true, message: 'Test email sent to devarapujames@gmail.com' });
    } catch (error) {
      console.error('Test email error:', error);
      res.status(500).json({ error: error.message, stack: error.stack });
    }
  });

  // Password Reset (no auth required)
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      console.log('Sending OTP to:', email, 'OTP:', otp);
      
      try {
        await sendOTP(email, otp);
        
        // Store OTP temporarily (in production, use Redis or database)
        req.session.resetOtp = otp;
        req.session.resetEmail = email;
        
        res.json({ success: true });
      } catch (emailError) {
        console.error('Email send error:', emailError);
        throw emailError;
      }
    } catch (error) {
      console.error('OTP send error:', error);
      res.status(500).json({ error: "Failed to send OTP", details: error.message });
    }
  });

  app.post("/api/verify-otp", async (req, res) => {
    try {
      const { otp } = req.body;
      
      if (otp === req.session.resetOtp) {
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "Invalid OTP" });
      }
    } catch (error) {
      res.status(500).json({ error: "OTP verification failed" });
    }
  });

  // Product Likes
  app.get("/api/products/:id/likes", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.json({ liked: false, count: 0 });
      }
      const liked = await storage.isProductLiked(req.params.id, req.session.userId);
      const count = await storage.getProductLikesCount(req.params.id);
      res.json({ liked, count });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch likes" });
    }
  });

  app.post("/api/products/:id/like", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Login required" });
      }
      await storage.likeProduct(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to like product" });
    }
  });

  app.delete("/api/products/:id/like", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Login required" });
      }
      await storage.unlikeProduct(req.params.id, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to unlike product" });
    }
  });

  return httpServer;
}
