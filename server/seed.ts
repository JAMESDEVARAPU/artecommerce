import { db } from "./db";
import {
  products,
  artClasses,
  workshops,
  testimonials,
  galleryItems,
} from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Seed Products
  await db.insert(products).values([
    {
      name: "Handcrafted Ceramic Vase",
      description: "Beautiful handmade ceramic vase with dried flowers arrangement, perfect for any home décor.",
      price: "89.00",
      category: "decor",
      imageUrl: "/attached_assets/generated_images/handmade_ceramic_product.png",
      inStock: true,
      isCustomizable: true,
      featured: true,
    },
    {
      name: "Macramé Wall Hanging",
      description: "Elegant handmade macramé wall hanging in cream and beige colors, natural textures for minimalist homes.",
      price: "65.00",
      category: "decor",
      imageUrl: "/attached_assets/generated_images/macrame_wall_decor.png",
      inStock: true,
      isCustomizable: true,
      featured: true,
    },
    {
      name: "Hand-Painted Decorative Plates Set",
      description: "Colorful hand-painted decorative plates with folk art patterns, vibrant yet earthy colors.",
      price: "125.00",
      category: "crafts",
      imageUrl: "/attached_assets/generated_images/hand-painted_plates.png",
      inStock: true,
      isCustomizable: false,
      featured: true,
    },
    {
      name: "Custom Gift Box",
      description: "Handmade personalized gift box with dried flowers and ribbons, perfect for special occasions.",
      price: "45.00",
      category: "gifts",
      imageUrl: "/attached_assets/generated_images/custom_gift_box.png",
      inStock: true,
      isCustomizable: true,
      featured: true,
    },
    {
      name: "Abstract Canvas Painting",
      description: "Original abstract canvas painting in warm earth tones, signed by the artist.",
      price: "250.00",
      category: "paintings",
      inStock: true,
      isCustomizable: false,
      featured: false,
    },
    {
      name: "Wooden Photo Frame",
      description: "Handcrafted wooden photo frame with intricate carving details.",
      price: "55.00",
      category: "decor",
      inStock: true,
      isCustomizable: true,
      featured: false,
    },
  ]).onConflictDoNothing();

  // Seed Art Classes
  await db.insert(artClasses).values([
    {
      title: "Watercolor Basics for Kids",
      description: "Fun introduction to watercolor painting for children ages 6-12. Learn color mixing, brush techniques, and create beautiful artworks.",
      ageGroup: "kids",
      skillLevel: "beginner",
      format: "offline",
      duration: "1.5 hours",
      schedule: "Saturdays 10:00 AM",
      price: "35.00",
      maxStudents: 12,
      enrolledCount: 8,
      imageUrl: "/attached_assets/generated_images/kids_art_class_setting.png",
      isActive: true,
    },
    {
      title: "Acrylic Painting Masterclass",
      description: "Comprehensive acrylic painting course for adults. Master layering, blending, and composition techniques.",
      ageGroup: "adults",
      skillLevel: "intermediate",
      format: "both",
      duration: "2 hours",
      schedule: "Wednesdays 6:00 PM",
      price: "55.00",
      maxStudents: 10,
      enrolledCount: 6,
      isActive: true,
    },
    {
      title: "Sketching & Drawing Fundamentals",
      description: "Learn the foundations of sketching and drawing. Perfect for absolute beginners wanting to start their art journey.",
      ageGroup: "all",
      skillLevel: "beginner",
      format: "online",
      duration: "1 hour",
      schedule: "Mondays 7:00 PM",
      price: "25.00",
      maxStudents: 20,
      enrolledCount: 15,
      isActive: true,
    },
    {
      title: "Advanced Portrait Drawing",
      description: "Take your portrait skills to the next level. Learn proportions, shading, and capturing likeness.",
      ageGroup: "adults",
      skillLevel: "advanced",
      format: "offline",
      duration: "2.5 hours",
      schedule: "Fridays 5:00 PM",
      price: "75.00",
      maxStudents: 8,
      enrolledCount: 5,
      isActive: true,
    },
  ]).onConflictDoNothing();

  // Seed Workshops
  await db.insert(workshops).values([
    {
      title: "Holiday Ornament Making",
      description: "Create beautiful handmade ornaments perfect for the holiday season. All materials included!",
      date: new Date("2025-01-15"),
      time: "2:00 PM",
      duration: "3 hours",
      venue: "Artistry Studio, 123 Creative Lane",
      price: "65.00",
      maxSeats: 15,
      bookedSeats: 8,
      imageUrl: "/attached_assets/generated_images/adult_workshop_scene.png",
      isPast: false,
    },
    {
      title: "Resin Art Workshop",
      description: "Learn the art of resin crafting. Create stunning coasters, jewelry, and decorative pieces.",
      date: new Date("2025-01-22"),
      time: "10:00 AM",
      duration: "4 hours",
      venue: "Artistry Studio, 123 Creative Lane",
      price: "85.00",
      maxSeats: 12,
      bookedSeats: 4,
      isPast: false,
    },
    {
      title: "Macramé Plant Hangers",
      description: "Create your own beautiful macramé plant hanger. Perfect for beginners!",
      date: new Date("2025-02-05"),
      time: "3:00 PM",
      duration: "2.5 hours",
      venue: "Artistry Studio, 123 Creative Lane",
      price: "55.00",
      maxSeats: 10,
      bookedSeats: 2,
      isPast: false,
    },
  ]).onConflictDoNothing();

  // Seed Testimonials
  await db.insert(testimonials).values([
    {
      authorName: "Sarah Mitchell",
      role: "student",
      content: "The watercolor class was absolutely amazing! Maya is such a patient and inspiring teacher. My daughter looks forward to every Saturday session.",
      rating: 5,
      isVisible: true,
    },
    {
      authorName: "David Chen",
      role: "customer",
      content: "I ordered a custom gift box for my wife's birthday and it exceeded all expectations. The attention to detail and personal touches made it truly special.",
      rating: 5,
      isVisible: true,
    },
    {
      authorName: "Emily Rodriguez",
      role: "student",
      content: "The online sketching fundamentals course helped me finally start my art journey. The techniques I learned have completely transformed my drawing skills.",
      rating: 5,
      isVisible: true,
    },
    {
      authorName: "Michael Thompson",
      role: "customer",
      content: "The macramé wall hanging I purchased is stunning. It's become the centerpiece of our living room. Beautiful craftsmanship!",
      rating: 5,
      isVisible: true,
    },
  ]).onConflictDoNothing();

  // Seed Gallery Items
  await db.insert(galleryItems).values([
    {
      title: "Autumn Sunset",
      description: "Acrylic painting inspired by California sunsets",
      category: "paintings",
      imageUrl: "/attached_assets/generated_images/artist_workspace_hero_image.png",
      isFeatured: true,
    },
    {
      title: "Ceramic Vase Collection",
      description: "Handcrafted ceramic vases with natural glazes",
      category: "decor",
      imageUrl: "/attached_assets/generated_images/handmade_ceramic_product.png",
      isFeatured: true,
    },
    {
      title: "Boho Wall Art",
      description: "Macramé and mixed media wall hanging",
      category: "decor",
      imageUrl: "/attached_assets/generated_images/macrame_wall_decor.png",
      isFeatured: false,
    },
    {
      title: "Folk Art Plates",
      description: "Hand-painted plates with traditional patterns",
      category: "crafts",
      imageUrl: "/attached_assets/generated_images/hand-painted_plates.png",
      isFeatured: true,
    },
    {
      title: "Gift Box Collection",
      description: "Custom gift boxes for all occasions",
      category: "gifts",
      imageUrl: "/attached_assets/generated_images/custom_gift_box.png",
      isFeatured: false,
    },
    {
      title: "Workshop Creations",
      description: "Art created during our community workshops",
      category: "crafts",
      imageUrl: "/attached_assets/generated_images/adult_workshop_scene.png",
      isFeatured: false,
    },
  ]).onConflictDoNothing();

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
