import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountPercent: integer("discount_percent").default(0),
  category: text("category").notNull(), // 'decor', 'gifts', 'paintings', 'crafts'
  imageUrl: text("image_url"),
  stockQuantity: integer("stock_quantity").default(0),
  stockStatus: text("stock_status").default("available"), // 'available', 'out_of_stock', 'limited'
  isEnabled: boolean("is_enabled").default(true),
  isCustomizable: boolean("is_customizable").default(false),
  featured: boolean("featured").default(false),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address").notNull(),
  status: text("status").default("new"), // 'new', 'in_progress', 'completed', 'delivered', 'cancelled'
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  isCustomOrder: boolean("is_custom_order").default(false),
  customOrderDetails: text("custom_order_details"),
  paymentStatus: text("payment_status").default("pending"), // 'pending', 'paid', 'failed', 'refunded'
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Items table
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Art Classes table
export const artClasses = pgTable("art_classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ageGroup: text("age_group").notNull(), // 'kids', 'adults', 'all'
  skillLevel: text("skill_level").notNull(), // 'beginner', 'intermediate', 'advanced'
  format: text("format").notNull(), // 'online', 'offline', 'both'
  duration: text("duration").notNull(),
  schedule: text("schedule").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  maxStudents: integer("max_students").default(10),
  enrolledCount: integer("enrolled_count").default(0),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
});

export const insertArtClassSchema = createInsertSchema(artClasses).omit({ id: true, enrolledCount: true });
export type InsertArtClass = z.infer<typeof insertArtClassSchema>;
export type ArtClass = typeof artClasses.$inferSelect;

// Class Registrations table
export const classRegistrations = pgTable("class_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").notNull().references(() => artClasses.id),
  studentName: text("student_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  parentName: text("parent_name"), // For kids' classes
  paymentStatus: text("payment_status").default("pending"), // 'pending', 'paid', 'refunded'
  registeredAt: timestamp("registered_at").defaultNow(),
});

export const artClassesRelations = relations(artClasses, ({ many }) => ({
  registrations: many(classRegistrations),
}));

export const classRegistrationsRelations = relations(classRegistrations, ({ one }) => ({
  class: one(artClasses, { fields: [classRegistrations.classId], references: [artClasses.id] }),
}));

export const insertClassRegistrationSchema = createInsertSchema(classRegistrations).omit({ id: true, registeredAt: true });
export type InsertClassRegistration = z.infer<typeof insertClassRegistrationSchema>;
export type ClassRegistration = typeof classRegistrations.$inferSelect;

// Workshops table
export const workshops = pgTable("workshops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  duration: text("duration").notNull(),
  venue: text("venue").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  maxSeats: integer("max_seats").notNull(),
  bookedSeats: integer("booked_seats").default(0),
  imageUrl: text("image_url"),
  isPast: boolean("is_past").default(false),
});

export const insertWorkshopSchema = createInsertSchema(workshops).omit({ id: true, bookedSeats: true, isPast: true });
export type InsertWorkshop = z.infer<typeof insertWorkshopSchema>;
export type Workshop = typeof workshops.$inferSelect;

// Workshop Bookings table
export const workshopBookings = pgTable("workshop_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workshopId: varchar("workshop_id").notNull().references(() => workshops.id),
  attendeeName: text("attendee_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  numberOfSeats: integer("number_of_seats").default(1),
  paymentStatus: text("payment_status").default("pending"),
  bookedAt: timestamp("booked_at").defaultNow(),
});

export const workshopsRelations = relations(workshops, ({ many }) => ({
  bookings: many(workshopBookings),
}));

export const workshopBookingsRelations = relations(workshopBookings, ({ one }) => ({
  workshop: one(workshops, { fields: [workshopBookings.workshopId], references: [workshops.id] }),
}));

export const insertWorkshopBookingSchema = createInsertSchema(workshopBookings).omit({ id: true, bookedAt: true });
export type InsertWorkshopBooking = z.infer<typeof insertWorkshopBookingSchema>;
export type WorkshopBooking = typeof workshopBookings.$inferSelect;

// Testimonials table
export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorName: text("author_name").notNull(),
  role: text("role"), // 'student', 'customer', 'parent'
  content: text("content").notNull(),
  rating: integer("rating").default(5),
  avatarUrl: text("avatar_url"),
  isVisible: boolean("is_visible").default(true),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true });
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// Contact Messages table
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, isRead: true, createdAt: true });
export type InsertContactSchema = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Gallery Items table (for portfolio/gallery page)
export const galleryItems = pgTable("gallery_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // 'decor', 'gifts', 'paintings', 'crafts'
  imageUrl: text("image_url").notNull(),
  isFeatured: boolean("is_featured").default(false),
});

export const insertGalleryItemSchema = createInsertSchema(galleryItems).omit({ id: true });
export type InsertGalleryItem = z.infer<typeof insertGalleryItemSchema>;
export type GalleryItem = typeof galleryItems.$inferSelect;

// Product Likes table
export const productLikes = pgTable("product_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductLikeSchema = createInsertSchema(productLikes).omit({ id: true, createdAt: true });
export type InsertProductLike = z.infer<typeof insertProductLikeSchema>;
export type ProductLike = typeof productLikes.$inferSelect;

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Cart item type (for frontend state, not persisted)
export type CartItem = {
  productId: string;
  productName: string;
  price: string;
  quantity: number;
  imageUrl?: string | null;
};
