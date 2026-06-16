const API_BASE = "https://encrust-jingle-tubby.ngrok-free.dev/api";

export const fetchHealth = async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
}