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
};

export type Shoot = {
  id: number;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
};

export type ItemAvailability = {
  item_id: number;
  name: string;
  type: string;
  count: number;
  available: number;
  booked: number;
};

export type TimelineEntry = {
  date: string;
  item_id: number;
  available: number;
};

export type TypeTimelineEntry = {
  date: string;
  type: string;
  available: number;
};

export type DashboardData = {
  stock: ItemAvailability[];
  timeline: TimelineEntry[];
  type_timeline: TypeTimelineEntry[];
};
