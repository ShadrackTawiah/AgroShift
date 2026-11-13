
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("AgroShift API Error:", error);
    throw error;
  }
}
