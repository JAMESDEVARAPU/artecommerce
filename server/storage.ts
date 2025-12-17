import {
  users,
  products,
  orders,
  orderItems,
  artClasses,
  classRegistrations,
  workshops,
  workshopBookings,
  testimonials,
  contacts,
  galleryItems,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type ArtClass,
  type InsertArtClass,
  type ClassRegistration,
  type InsertClassRegistration,
  type Workshop,
  type InsertWorkshop,
  type WorkshopBooking,
  type InsertWorkshopBooking,
  type Testimonial,
  type InsertTestimonial,
  type Contact,
  type InsertGalleryItem,
  type GalleryItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;

  // Art Classes
  getClasses(): Promise<ArtClass[]>;
  getClass(id: string): Promise<ArtClass | undefined>;
  createClass(artClass: InsertArtClass): Promise<ArtClass>;
  updateClass(id: string, artClass: Partial<InsertArtClass>): Promise<ArtClass | undefined>;
  deleteClass(id: string): Promise<void>;

  // Class Registrations
  getClassRegistrations(classId?: string): Promise<ClassRegistration[]>;
  createClassRegistration(registration: InsertClassRegistration): Promise<ClassRegistration>;

  // Workshops
  getWorkshops(): Promise<Workshop[]>;
  getWorkshop(id: string): Promise<Workshop | undefined>;
  createWorkshop(workshop: InsertWorkshop): Promise<Workshop>;
  updateWorkshop(id: string, workshop: Partial<InsertWorkshop>): Promise<Workshop | undefined>;
  deleteWorkshop(id: string): Promise<void>;

  // Workshop Bookings
  getWorkshopBookings(workshopId?: string): Promise<WorkshopBooking[]>;
  createWorkshopBooking(booking: InsertWorkshopBooking): Promise<WorkshopBooking>;

  // Testimonials
  getTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;

  // Contacts
  getContacts(): Promise<Contact[]>;
  createContact(contact: { name: string; email: string; phone?: string; subject?: string; message: string }): Promise<Contact>;
  updateContact(id: string, contact: Partial<Contact>): Promise<Contact | undefined>;

  // Gallery
  getGalleryItems(): Promise<GalleryItem[]>;
  createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated || undefined;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set(order).where(eq(orders.id, id)).returning();
    return updated || undefined;
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [created] = await db.insert(orderItems).values(item).returning();
    return created;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // Art Classes
  async getClasses(): Promise<ArtClass[]> {
    return await db.select().from(artClasses);
  }

  async getClass(id: string): Promise<ArtClass | undefined> {
    const [artClass] = await db.select().from(artClasses).where(eq(artClasses.id, id));
    return artClass || undefined;
  }

  async createClass(artClass: InsertArtClass): Promise<ArtClass> {
    const [created] = await db.insert(artClasses).values(artClass).returning();
    return created;
  }

  async updateClass(id: string, artClass: Partial<InsertArtClass>): Promise<ArtClass | undefined> {
    const [updated] = await db.update(artClasses).set(artClass).where(eq(artClasses.id, id)).returning();
    return updated || undefined;
  }

  async deleteClass(id: string): Promise<void> {
    await db.delete(artClasses).where(eq(artClasses.id, id));
  }

  // Class Registrations
  async getClassRegistrations(classId?: string): Promise<ClassRegistration[]> {
    if (classId) {
      return await db.select().from(classRegistrations).where(eq(classRegistrations.classId, classId));
    }
    return await db.select().from(classRegistrations).orderBy(desc(classRegistrations.registeredAt));
  }

  async createClassRegistration(registration: InsertClassRegistration): Promise<ClassRegistration> {
    const [created] = await db.insert(classRegistrations).values(registration).returning();
    // Update enrolled count
    const artClass = await this.getClass(registration.classId);
    if (artClass) {
      await this.updateClass(registration.classId, {
        enrolledCount: (artClass.enrolledCount || 0) + 1,
      } as any);
    }
    return created;
  }

  // Workshops
  async getWorkshops(): Promise<Workshop[]> {
    return await db.select().from(workshops).orderBy(desc(workshops.date));
  }

  async getWorkshop(id: string): Promise<Workshop | undefined> {
    const [workshop] = await db.select().from(workshops).where(eq(workshops.id, id));
    return workshop || undefined;
  }

  async createWorkshop(workshop: InsertWorkshop): Promise<Workshop> {
    const [created] = await db.insert(workshops).values(workshop).returning();
    return created;
  }

  async updateWorkshop(id: string, workshop: Partial<InsertWorkshop>): Promise<Workshop | undefined> {
    const [updated] = await db.update(workshops).set(workshop).where(eq(workshops.id, id)).returning();
    return updated || undefined;
  }

  async deleteWorkshop(id: string): Promise<void> {
    await db.delete(workshops).where(eq(workshops.id, id));
  }

  // Workshop Bookings
  async getWorkshopBookings(workshopId?: string): Promise<WorkshopBooking[]> {
    if (workshopId) {
      return await db.select().from(workshopBookings).where(eq(workshopBookings.workshopId, workshopId));
    }
    return await db.select().from(workshopBookings).orderBy(desc(workshopBookings.bookedAt));
  }

  async createWorkshopBooking(booking: InsertWorkshopBooking): Promise<WorkshopBooking> {
    const [created] = await db.insert(workshopBookings).values(booking).returning();
    // Update booked seats
    const workshop = await this.getWorkshop(booking.workshopId);
    if (workshop) {
      await this.updateWorkshop(booking.workshopId, {
        bookedSeats: (workshop.bookedSeats || 0) + (booking.numberOfSeats || 1),
      } as any);
    }
    return created;
  }

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [created] = await db.insert(testimonials).values(testimonial).returning();
    return created;
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async createContact(contact: any): Promise<Contact> {
    const [created] = await db.insert(contacts).values(contact).returning();
    return created;
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact | undefined> {
    const [updated] = await db.update(contacts).set(contact).where(eq(contacts.id, id)).returning();
    return updated || undefined;
  }

  // Gallery
  async getGalleryItems(): Promise<GalleryItem[]> {
    return await db.select().from(galleryItems);
  }

  async createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem> {
    const [created] = await db.insert(galleryItems).values(item).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
