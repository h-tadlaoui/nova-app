import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ItemType = "lost" | "found" | "anonymous";
export type ItemStatus = "active" | "matched" | "recovered" | "closed";

export interface Item {
  id: string;
  user_id: string;
  type: ItemType;
  category: string;
  description: string | null;
  brand: string | null;
  color: string | null;
  location: string;
  date: string;
  time: string | null;
  status: ItemStatus;
  image_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export const useItems = (type?: ItemType, userId?: string, status?: ItemStatus) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        let query = supabase.from("items").select("*");

        if (type) {
          query = query.eq("type", type);
        }

        if (userId) {
          query = query.eq("user_id", userId);
        }

        if (status) {
          query = query.eq("status", status);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        setItems(data as Item[]);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [type, userId, status]);

  return { items, loading, error, refetch: () => setLoading(true) };
};

export const useMyItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyItems = async () => {
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setItems([]);
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("items")
          .select("*")
          .eq("user_id", session.session.user.id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setItems(data as Item[]);
      } catch (err) {
        console.error("Error fetching my items:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    };

    fetchMyItems();
  }, []);

  return { items, loading, error };
};

export const createItem = async (
  itemData: {
    type: ItemType;
    category: string;
    description?: string;
    brand?: string;
    color?: string;
    location: string;
    date: string;
    time?: string;
    contact_email?: string;
    contact_phone?: string;
    image?: File;
  }
) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("You must be logged in to create a report");
    }

    let imageUrl: string | null = null;

    // Upload image if provided
    if (itemData.image) {
      const fileExt = itemData.image.name.split(".").pop();
      const fileName = `${session.session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(fileName, itemData.image);

      if (uploadError) {
        console.error("Image upload error:", uploadError);
        toast.error("Failed to upload image, but continuing with report");
      } else {
        const { data: urlData } = supabase.storage
          .from("item-images")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    // Insert item
    const { data, error } = await supabase
      .from("items")
      .insert({
        user_id: session.session.user.id,
        type: itemData.type,
        category: itemData.category,
        description: itemData.description || null,
        brand: itemData.brand || null,
        color: itemData.color || null,
        location: itemData.location,
        date: itemData.date,
        time: itemData.time || null,
        contact_email: itemData.contact_email || null,
        contact_phone: itemData.contact_phone || null,
        image_url: imageUrl,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Item;
  } catch (err) {
    console.error("Error creating item:", err);
    throw err;
  }
};

export const updateItemStatus = async (itemId: string, status: ItemStatus) => {
  try {
    const { error } = await supabase
      .from("items")
      .update({ status })
      .eq("id", itemId);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error("Error updating item status:", err);
    throw err;
  }
};
