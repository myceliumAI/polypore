/**
 * Shared types for the entire application.
 */

export type Item = {
  id: number;
  name: string;
  type: "camera" | "light" | "cable" | "other";
  total_stock: number;
};

export type Booking = {
  id: number;
  item_id: number;
  shoot_id: number;
  quantity: number;
  description?: string | null;
};

export type Shoot = {
  id: number;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
};
