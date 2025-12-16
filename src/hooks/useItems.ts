import { useState, useEffect } from "react";
import { apiClient } from "@/integrations/django/client";
import { toast } from "sonner";
import type { Item, ItemStatus, ItemType } from "@/types/item";

export const useItems = (type?: ItemType, userId?: string, status?: ItemStatus, category?: string, search?: string) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (userId) params.append('user', userId);
      if (status) params.append('status', status);
      if (category && category !== "All") params.append('category', category);
      if (search) params.append('search', search);

      const response = await apiClient(`/items/?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type, userId, status, category, search]);

  return { items, loading, error, refetch: fetchItems };
};

export const useMyItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyItems = async () => {
      setLoading(true);
      try {
        const response = await apiClient('/items/my_items/');

        if (!response.ok) {
          // If 401, mostly handled by client calling auto-refresh or logout, 
          // but we might get here if token completely invalid.
          if (response.status === 401) {
            setItems([]);
            return;
          }
          throw new Error('Failed to fetch my items');
        }

        const data = await response.json();
        // Handle paginated response
        setItems(Array.isArray(data) ? data : data.results || []);
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
    const formData = new FormData();

    formData.append('type', itemData.type);
    formData.append('category', itemData.category);
    formData.append('location', itemData.location);
    formData.append('date', itemData.date);

    if (itemData.description) formData.append('description', itemData.description);
    if (itemData.brand) formData.append('brand', itemData.brand);
    if (itemData.color) formData.append('color', itemData.color);
    if (itemData.time) formData.append('time', itemData.time);
    if (itemData.contact_email) formData.append('contact_email', itemData.contact_email);
    if (itemData.contact_phone) formData.append('contact_phone', itemData.contact_phone);
    if (itemData.image) formData.append('image', itemData.image);

    const response = await apiClient('/items/', {
      method: 'POST',
      body: formData, // apiClient will NOT set Content-Type to json if body is not string
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = Object.values(errorData).flat().join(', ') || 'Failed to create item';
      throw new Error(errorMessage);
    }

    return await response.json() as Item;
  } catch (err) {
    console.error("Error creating item:", err);
    throw err;
  }
};


export const getItem = async (itemId: string | number) => {
  try {
    const response = await apiClient(`/items/${itemId}/`);

    if (!response.ok) {
      throw new Error('Failed to fetch item');
    }

    return await response.json() as Item;
  } catch (err) {
    console.error("Error fetching item:", err);
    throw err;
  }
};

export const updateItemStatus = async (itemId: number | string, status: ItemStatus) => {
  try {
    const response = await apiClient(`/items/${itemId}/update_status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update item status');
    }
  } catch (err) {
    console.error("Error updating item status:", err);
    throw err;
  }
};
