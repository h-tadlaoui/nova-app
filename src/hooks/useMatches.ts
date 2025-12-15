import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MatchStatus = "pending" | "confirmed" | "rejected";

export interface Match {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  match_score: number;
  status: MatchStatus;
  created_at: string;
  lost_item?: {
    id: string;
    category: string;
    description: string | null;
    location: string;
    date: string;
    image_url: string | null;
  };
  found_item?: {
    id: string;
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
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setMatches([]);
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("matches")
          .select(`
            *,
            lost_item:items!matches_lost_item_id_fkey(id, category, description, location, date, image_url),
            found_item:items!matches_found_item_id_fkey(id, category, description, location, date, image_url)
          `)
          .order("match_score", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setMatches(data as Match[]);
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

export const triggerAIMatching = async (itemId: string, itemType: "lost" | "found") => {
  try {
    const { data, error } = await supabase.functions.invoke("ai-match", {
      body: { itemId, itemType },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error triggering AI matching:", err);
    throw err;
  }
};

export const updateMatchStatus = async (matchId: string, status: MatchStatus) => {
  try {
    const { error } = await supabase
      .from("matches")
      .update({ status })
      .eq("id", matchId);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error("Error updating match status:", err);
    throw err;
  }
};
