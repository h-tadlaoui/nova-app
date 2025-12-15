import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type RequestStatus = "pending" | "approved" | "denied";

export interface ContactRequest {
  id: string;
  item_id: string;
  requester_id: string;
  status: RequestStatus;
  requester_message: string | null;
  requester_email: string;
  requester_phone: string | null;
  created_at: string;
  updated_at: string;
  item?: {
    id: string;
    category: string;
    location: string;
    type: string;
    contact_email: string | null;
    contact_phone: string | null;
  };
}

export const useMyContactRequests = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setRequests([]);
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("contact_requests")
          .select(`
            *,
            item:items(id, category, location, type, contact_email, contact_phone)
          `)
          .eq("requester_id", session.session.user.id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setRequests(data as ContactRequest[]);
      } catch (err) {
        console.error("Error fetching contact requests:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return { requests, loading, error };
};

export const useRequestsForMyItems = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setRequests([]);
          setLoading(false);
          return;
        }

        // First get user's items
        const { data: myItems } = await supabase
          .from("items")
          .select("id")
          .eq("user_id", session.session.user.id);

        if (!myItems || myItems.length === 0) {
          setRequests([]);
          setLoading(false);
          return;
        }

        const itemIds = myItems.map((item) => item.id);

        const { data, error: fetchError } = await supabase
          .from("contact_requests")
          .select(`
            *,
            item:items(id, category, location, type, contact_email, contact_phone)
          `)
          .in("item_id", itemIds)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setRequests(data as ContactRequest[]);
      } catch (err) {
        console.error("Error fetching requests for my items:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return { requests, loading, error };
};

export const createContactRequest = async (
  itemId: string,
  message: string,
  email: string,
  phone?: string
) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("You must be logged in to request contact");
    }

    const { data, error } = await supabase
      .from("contact_requests")
      .insert({
        item_id: itemId,
        requester_id: session.session.user.id,
        requester_message: message,
        requester_email: email,
        requester_phone: phone || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error creating contact request:", err);
    throw err;
  }
};

export const updateContactRequestStatus = async (
  requestId: string,
  status: RequestStatus
) => {
  try {
    const { error } = await supabase
      .from("contact_requests")
      .update({ status })
      .eq("id", requestId);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error("Error updating contact request status:", err);
    throw err;
  }
};
