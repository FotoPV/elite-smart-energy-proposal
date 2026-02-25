import { useEffect } from "react";
import { useLocation } from "wouter";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031440910/HjYyMQuvAHbASIiI.jpg";

export default function Home() {
  const [, setLocation] = useLocation();

  // Fully public — immediately redirect to the proposals dashboard
  useEffect(() => {
    setLocation("/proposals/new");
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <img src={LOGO_URL} alt="Elite Smart Energy Solutions" className="h-16" />
        <p style={{ fontFamily: "'Open Sans', sans-serif", color: '#4A6B8A' }}>Loading...</p>
      </div>
    </div>
  );
}
