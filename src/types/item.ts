export type ItemStatus =
  | "active"
  | "matched"
  | "recovered"
  | "closed"
  | "archived";

export type ItemType = "lost" | "found" | "anonymous";

export interface Item {
  id: number;
  user?: number; // Django provides this
  type: ItemType;
  category: string;
  description: string | null;
  brand: string | null;
  color: string | null;
  location: string;
  date: string;
  time: string | null;
  status: ItemStatus;
  image_url: string | null; // Django serializer uses image_url
  contact_email: string | null;
  contact_phone: string | null;
  user_email?: string;
  created_at?: string;
  updated_at?: string;
  ai_indexed?: boolean;
}

export interface ContactRequest {
  id: number;
  item: number;
  item_category?: string;
  item_type?: string;
  item_location?: string;
  item_contact_email?: string;
  item_contact_phone?: string;
  requester: number;
  status: "pending" | "approved" | "denied";
  requester_message: string | null;
  requester_email: string;
  requester_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  preferredMethod: "email" | "phone" | "both";
}
