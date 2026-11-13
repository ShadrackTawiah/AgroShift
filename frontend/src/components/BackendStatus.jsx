
import { useEffect, useState } from "react";
import { checkBackendHealth } from "../services/api";

function BackendStatus() {
  const [status, setStatus] = useState("Checking connection...");
  const [error, setError] = useState("");

  useEffect(() => {
    checkBackendHealth()
      .then((data) => {
        if (data.status === "healthy") {
          setStatus("Connected to AgroShift backend");
          setError("");
        } else {
          setStatus("Unexpected backend response");
        }
      })
      .catch((err) => {
        setStatus("Backend connection failed");
        setError(err.message);
      });
  }, []);

  return (
    <div style={{ padding: "12px", textAlign: "center" }}>
      <p>{status}</p>
      {error && (
        <p style={{ color: "red", fontSize: "13px" }}>
          Error: {error}
        </p>
      )}
    </div>
  );
}

export default BackendStatus;
