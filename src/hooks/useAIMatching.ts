import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useAIMatching = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchType, setSearchType] = useState<"lost" | "found">("lost");

  const startMatching = useCallback((type: "lost" | "found") => {
    setSearchType(type);
    setIsProcessing(true);
  }, []);

  const handleProcessingComplete = useCallback(() => {
    setIsProcessing(false);
    // Navigate to full page match results instead of showing dialog
    navigate(`/match-results?type=${searchType}`);
  }, [searchType, navigate]);

  return {
    isProcessing,
    searchType,
    startMatching,
    handleProcessingComplete,
  };
};
