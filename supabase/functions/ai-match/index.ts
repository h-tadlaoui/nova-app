import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itemId, itemType } = await req.json();
    
    console.log(`Starting AI match for item ${itemId} of type ${itemType}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the source item
    const { data: sourceItem, error: sourceError } = await supabase
      .from("items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (sourceError || !sourceItem) {
      console.error("Source item not found:", sourceError);
      return new Response(
        JSON.stringify({ error: "Source item not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine what type of items to search for matches
    const oppositeType = itemType === "lost" ? "found" : "lost";

    // Fetch potential matches (opposite type, active status)
    const { data: potentialMatches, error: matchError } = await supabase
      .from("items")
      .select("*")
      .eq("type", oppositeType)
      .eq("status", "active")
      .neq("user_id", sourceItem.user_id);

    if (matchError) {
      console.error("Error fetching potential matches:", matchError);
      return new Response(
        JSON.stringify({ error: "Error fetching potential matches" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!potentialMatches || potentialMatches.length === 0) {
      console.log("No potential matches found");
      return new Response(
        JSON.stringify({ matches: [], message: "No potential matches found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI to analyze similarity
    const prompt = `You are an AI assistant that matches lost and found items. Analyze the following items and return match scores.

SOURCE ITEM (${sourceItem.type}):
- Category: ${sourceItem.category}
- Description: ${sourceItem.description || "N/A"}
- Brand: ${sourceItem.brand || "N/A"}
- Color: ${sourceItem.color || "N/A"}
- Location: ${sourceItem.location}
- Date: ${sourceItem.date}

POTENTIAL MATCHES:
${potentialMatches.map((item, i) => `
${i + 1}. ID: ${item.id}
   - Category: ${item.category}
   - Description: ${item.description || "N/A"}
   - Brand: ${item.brand || "N/A"}
   - Color: ${item.color || "N/A"}
   - Location: ${item.location}
   - Date: ${item.date}
`).join("\n")}

Analyze each potential match and provide a match score (0-100) based on:
1. Category similarity (30%)
2. Description and feature similarity (30%)
3. Brand/color match (20%)
4. Location proximity (10%)
5. Time relevance (10%)

Return ONLY valid JSON in this exact format (no other text):
{"matches": [{"id": "uuid", "score": 85, "reason": "brief explanation"}]}

Only include items with score >= 50.`;

    console.log("Calling AI for matching analysis...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert at matching lost and found items. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI response:", aiContent);

    // Parse the AI response
    let matchResults;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        matchResults = JSON.parse(jsonMatch[0]);
      } else {
        matchResults = { matches: [] };
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      matchResults = { matches: [] };
    }

    // Store matches in database
    const matchesToInsert = [];
    for (const match of matchResults.matches || []) {
      if (match.score >= 50) {
        const matchData = {
          lost_item_id: itemType === "lost" ? itemId : match.id,
          found_item_id: itemType === "found" ? itemId : match.id,
          match_score: Math.min(100, Math.max(0, Math.round(match.score))),
          status: "pending",
        };
        matchesToInsert.push(matchData);
      }
    }

    if (matchesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("matches")
        .upsert(matchesToInsert, { 
          onConflict: "lost_item_id,found_item_id",
          ignoreDuplicates: true 
        });

      if (insertError) {
        console.error("Error inserting matches:", insertError);
      } else {
        console.log(`Inserted ${matchesToInsert.length} matches`);
        
        // Update source item status if matches found
        await supabase
          .from("items")
          .update({ status: "matched" })
          .eq("id", itemId);
      }
    }

    // Return enriched match data
    const enrichedMatches = matchResults.matches?.map((match: any) => {
      const matchedItem = potentialMatches.find((p) => p.id === match.id);
      return {
        ...match,
        item: matchedItem,
      };
    }) || [];

    return new Response(
      JSON.stringify({ 
        matches: enrichedMatches,
        totalFound: enrichedMatches.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-match function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
