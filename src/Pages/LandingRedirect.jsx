import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Offline-safe: cached user ho to Home, warna Login
    navigate(localStorage.getItem("user") ? "/Home" : "/login");
  }, [navigate]);

  return <p>Loading...</p>;
}
