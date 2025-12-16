import { useState, useEffect } from "react";
import { apiClient } from "@/integrations/django/client";

export type MatchStatus = "pending" | "confirmed" | "rejected";

export interface Match {
  id: number;
  lost_item_id: number;
  found_item_id: number;
  match_score: number;
  status: MatchStatus;
  created_at: string;
  lost_item?: {
    id: number;
    category: string;
    description: string | null;
    location: string;
    date: string;
    image_url: string | null;
  };
  found_item?: {
    id: number;
    category: string;
    description: string | null;
    location: string;
    date: string;
    image_url: string | null;
  };
}

export const useMyMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const response = await apiClient('/matches/');

        if (!response.ok) {
          if (response.status === 401) {
            setMatches([]);
            return;
          }
          throw new Error('Failed to fetch matches');
        }

        const data = await response.json();
        // Handle paginated response
        setMatches(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch matches");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return { matches, loading, error };
};

export const triggerAIMatching = async (itemId: number | string, itemType: "lost" | "found") => {
  try {
    const response = await apiClient('/matches/trigger_matching/', {
      method: 'POST',
      body: JSON.stringify({
        item_id: itemId,
        item_type: itemType,
      }),
    });

    if (!response.ok) {
      throw new Error('AI matching failed');
    }

    return await response.json();
  } catch (err) {
    console.error("Error triggering AI matching:", err);
    throw err;
  }
};

export const updateMatchStatus = async (matchId: number | string, status: MatchStatus) => {
  try {
    const response = await apiClient(`/matches/${matchId}/update_status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update match status');
    }
  } catch (err) {
    console.error("Error updating match status:", err);
    throw err;
  }
};
