import { useState, useCallback } from "react";

interface MatchItem {
  id: number;
  category: string;
  description: string;
  location: string;
  date: string;
  matchScore: number;
  type: "lost" | "found";
}

// Mock matching function - will be replaced with real AI matching
const generateMockMatches = (searchType: "lost" | "found"): MatchItem[] => {
  const mockFoundItems: MatchItem[] = [
    {
      id: 1,
      category: "Phone",
      description: "Black iPhone found near entrance",
      location: "Central Park",
      date: "2024-03-16",
      matchScore: 87,
      type: "found",
    },
    {
      id: 2,
      category: "Phone",
      description: "Dark smartphone with cracked screen",
      location: "Downtown Area",
      date: "2024-03-15",
      matchScore: 72,
      type: "found",
    },
    {
      id: 3,
      category: "Phone",
      description: "Mobile phone in black case",
      location: "City Library",
      date: "2024-03-14",
      matchScore: 58,
      type: "found",
    },
  ];

  const mockLostItems: MatchItem[] = [
    {
      id: 1,
      category: "Keys",
      description: "Lost my house keys with blue keychain",
      location: "Shopping Mall",
      date: "2024-03-16",
      matchScore: 92,
      type: "lost",
    },
    {
      id: 2,
      category: "Keys",
      description: "Set of keys missing since yesterday",
      location: "Downtown",
      date: "2024-03-15",
      matchScore: 68,
      type: "lost",
    },
  ];

  return searchType === "lost" ? mockFoundItems : mockLostItems;
};

export const useAIMatching = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [searchType, setSearchType] = useState<"lost" | "found">("lost");

  const startMatching = useCallback((type: "lost" | "found") => {
    setSearchType(type);
    setIsProcessing(true);
    setMatches([]);
  }, []);

  const handleProcessingComplete = useCallback(() => {
    setIsProcessing(false);
    const results = generateMockMatches(searchType);
    setMatches(results);
    setShowResults(true);
  }, [searchType]);

  const closeResults = useCallback(() => {
    setShowResults(false);
    setMatches([]);
  }, []);

  return {
    isProcessing,
    showResults,
    matches,
    searchType,
    startMatching,
    handleProcessingComplete,
    closeResults,
  };
};
