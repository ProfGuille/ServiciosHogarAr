// Consolidated schema types for frontend consumption
// Note: Using plain TypeScript types to avoid dependency issues

// User types
export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  userType: "customer" | "provider" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
}

// Service Category types
export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  createdAt?: Date;
}

// Service Provider types
export interface ServiceProvider {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  serviceCategories?: number[];
  location?: string;
  hourlyRate?: number;
  isVerified?: boolean;
  rating?: number;
  totalReviews?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Service Request types
export interface ServiceRequest {
  id: string;
  customerId: string;
  serviceProviderId?: string;
  categoryId: number;
  title: string;
  description: string;
  location: string;
  urgency?: "low" | "medium" | "high";
  status?: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  budget?: number;
  scheduledFor?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Insert type for service requests (omitting generated fields)
export interface InsertServiceRequest {
  customerId: string;
  serviceProviderId?: string;
  categoryId: number;
  title: string;
  description: string;
  location: string;
  urgency?: "low" | "medium" | "high";
  status?: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  budget?: number;
  scheduledFor?: Date;
}

// Export as schema for compatibility
export const insertServiceRequestSchema = {} as any; // Placeholder for zod compatibility

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
  points?: number;
  isActive?: boolean;
  createdAt?: Date;
  earnedAt?: Date;
}

// Achievement with progress type
export interface AchievementWithProgress extends Achievement {
  progress?: number;
  isCompleted?: boolean;
  completedAt?: Date;
}

// Message types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType?: "text" | "image" | "file";
  isRead?: boolean;
  createdAt?: Date;
}

// Conversation types
export interface Conversation {
  id: string;
  serviceRequestId?: string;
  participants: string[];
  lastMessageAt?: Date;
  isActive?: boolean;
  createdAt?: Date;
}