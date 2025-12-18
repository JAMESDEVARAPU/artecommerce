import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: integer("is_admin", { mode: "boolean" }).default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const products = sqliteTable("products", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  discountPercent: integer("discount_percent").default(0),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  additionalImages: text("additional_images"),
  videoUrl: text("video_url"),
  stockQuantity: integer("stock_quantity").default(0),
  stockStatus: text("stock_status").default("available"),
  isEnabled: integer("is_enabled", { mode: "boolean" }).default(true),
  isCustomizable: integer("is_customizable", { mode: "boolean" }).default(false),
  featured: integer("featured", { mode: "boolean" }).default(false),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address").notNull(),
  status: text("status").default("new"),
  totalAmount: text("total_amount").notNull(),
  isCustomOrder: integer("is_custom_order", { mode: "boolean" }).default(false),
  customOrderDetails: text("custom_order_details"),
  paymentStatus: text("payment_status").default("pending"),
  paymentIntentId: text("payment_intent_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  orderId: text("order_id").notNull().references(() => orders.id),
  productId: text("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: text("price").notNull(),
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

export const artClasses = sqliteTable("art_classes", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ageGroup: text("age_group").notNull(),
  skillLevel: text("skill_level").notNull(),
  format: text("format").notNull(),
  duration: text("duration").notNull(),
  schedule: text("schedule").notNull(),
  price: text("price").notNull(),
  maxStudents: integer("max_students").default(10),
  enrolledCount: integer("enrolled_count").default(0),
  imageUrl: text("image_url"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const insertArtClassSchema = createInsertSchema(artClasses).omit({ id: true, enrolledCount: true });
export type InsertArtClass = z.infer<typeof insertArtClassSchema>;
export type ArtClass = typeof artClasses.$inferSelect;

export const classRegistrations = sqliteTable("class_registrations", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  classId: text("class_id").notNull().references(() => artClasses.id),
  studentName: text("student_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  parentName: text("parent_name"),
  paymentStatus: text("payment_status").default("pending"),
  registeredAt: integer("registered_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
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

export const workshops = sqliteTable("workshops", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  time: text("time").notNull(),
  duration: text("duration").notNull(),
  venue: text("venue").notNull(),
  price: text("price").notNull(),
  maxSeats: integer("max_seats").notNull(),
  bookedSeats: integer("booked_seats").default(0),
  imageUrl: text("image_url"),
  isPast: integer("is_past", { mode: "boolean" }).default(false),
});

export const insertWorkshopSchema = createInsertSchema(workshops).omit({ id: true, bookedSeats: true, isPast: true });
export type InsertWorkshop = z.infer<typeof insertWorkshopSchema>;
export type Workshop = typeof workshops.$inferSelect;

export const workshopBookings = sqliteTable("workshop_bookings", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  workshopId: text("workshop_id").notNull().references(() => workshops.id),
  attendeeName: text("attendee_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  numberOfSeats: integer("number_of_seats").default(1),
  paymentStatus: text("payment_status").default("pending"),
  bookedAt: integer("booked_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
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

export const testimonials = sqliteTable("testimonials", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  authorName: text("author_name").notNull(),
  role: text("role"),
  content: text("content").notNull(),
  rating: integer("rating").default(5),
  avatarUrl: text("avatar_url"),
  isVisible: integer("is_visible", { mode: "boolean" }).default(true),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true });
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, isRead: true, createdAt: true });
export type InsertContactSchema = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export const galleryItems = sqliteTable("gallery_items", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
});

export const insertGalleryItemSchema = createInsertSchema(galleryItems).omit({ id: true });
export type InsertGalleryItem = z.infer<typeof insertGalleryItemSchema>;
export type GalleryItem = typeof galleryItems.$inferSelect;

export const productLikes = sqliteTable("product_likes", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id),
  productId: text("product_id").notNull().references(() => products.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const insertProductLikeSchema = createInsertSchema(productLikes).omit({ id: true, createdAt: true });
export type InsertProductLike = z.infer<typeof insertProductLikeSchema>;
export type ProductLike = typeof productLikes.$inferSelect;

export type CartItem = {
  productId: string;
  productName: string;
  price: string;
  quantity: number;
  imageUrl?: string | null;
};
