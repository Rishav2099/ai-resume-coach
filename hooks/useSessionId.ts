import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export function useSessionId() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user already has a session ID
    let storedId = localStorage.getItem("resume_session_id");
    
    // If not, create a new one and save it
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem("resume_session_id", storedId);
    }
    
    setSessionId(storedId);
  }, []);

  return sessionId;
}