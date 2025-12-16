import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "@/integrations/django/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user has a valid access token
    const token = getAccessToken();

    if (!token) {
      navigate("/auth", { replace: true });
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
