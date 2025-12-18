export type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  discountPercent?: number;
  category: string;
  imageUrl?: string | null;
  additionalImages?: string[] | null;
  videoUrl?: string | null;
  stockQuantity?: number;
  stockStatus?: string;
  isEnabled?: boolean;
  isCustomizable?: boolean;
  featured?: boolean;
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: string;
  status?: string | null;
  totalAmount: string;
  isCustomOrder?: boolean;
  customOrderDetails?: string | null;
  paymentStatus?: string | null;
  paymentIntentId?: string | null;
  createdAt?: Date | null;
};

export type ArtClass = {
  id: string;
  title: string;
  description: string;
  ageGroup: string;
  skillLevel: string;
  format: string;
  duration: string;
  schedule: string;
  price: string;
  maxStudents?: number;
  enrolledCount?: number;
  imageUrl?: string | null;
  isActive?: boolean;
};

export type Workshop = {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  duration: string;
  venue: string;
  price: string;
  maxSeats: number;
  bookedSeats?: number;
  imageUrl?: string | null;
  isPast?: boolean;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  isRead?: boolean;
  createdAt?: Date | null;
};