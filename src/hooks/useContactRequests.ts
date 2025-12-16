import { useState, useEffect } from "react";
import { apiClient } from "@/integrations/django/client";
import { toast } from "sonner";
import type { ContactRequest } from "@/types/item";

export type RequestStatus = "pending" | "approved" | "denied";

export const useMyContactRequests = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await apiClient("/contact-requests/");
        if (!response.ok) throw new Error("Failed to fetch requests");

        const data = await response.json();
        // Handle paginated response
        setRequests(Array.isArray(data) ? data : data.results || []);
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
  return useMyContactRequests();
};

export const createContactRequest = async (
  itemId: number,
  message: string,
  email: string,
  phone?: string
) => {
  try {
    const response = await apiClient("/contact-requests/", {
      method: "POST",
      body: JSON.stringify({
        item: itemId,
        requester_message: message,
        requester_email: email,
        requester_phone: phone,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(JSON.stringify(err) || "Failed to create request");
    }

    return await response.json();
  } catch (err) {
    console.error("Error creating contact request:", err);
    throw err;
  }
};

export const updateContactRequestStatus = async (
  requestId: number,
  status: RequestStatus
) => {
  try {
    const response = await apiClient(`/contact-requests/${requestId}/update_status/`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    if (!response.ok) throw new Error("Failed to update status");

    return await response.json();
  } catch (err) {
    console.error("Error updating contact request status:", err);
    throw err;
  }
};
