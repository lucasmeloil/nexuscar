export type UserRole = 'admin' | 'seller' | 'client';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  document_url?: string;
  created_at: string;
}

export type VehicleStatus = 'available' | 'reserved' | 'sold';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  description: string;
  transmission?: string;
  fuel_type?: string;
  mileage?: number;
  color?: string;
  images: string[];
  status: VehicleStatus;
  is_featured?: boolean;
  is_promotion?: boolean;
  discount_price?: number;
  engine?: string;
  power?: string;
  drivetrain?: string;
  features?: string[];
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  vehicle_id: string;
  created_at: string;
}

export interface Sale {
  id: string;
  vehicle_id: string;
  seller_id: string;
  buyer_id: string;
  sale_price: number;
  sale_date: string;
  notes?: string;
}
