import { useEffect } from "react";
import { useLocation } from "wouter";

// Dashboard is no longer needed - redirect to New Proposal
export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    setLocation("/proposals/new");
  }, [setLocation]);

  return null;
}
