export type Leaflet = typeof import("leaflet");

// Leaflet browser chara chole na, tai shudhu browser e load kori
export async function loadLeaflet(): Promise<Leaflet> {
  const mod = await import("leaflet");
  return ((mod as unknown as { default?: Leaflet }).default ?? mod) as Leaflet;
}

export const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Shop er pin (emoji soho gol icon). Icon file lage na
export function emojiIcon(L: Leaflet, emoji: string, active = false) {
  const el = document.createElement("div");
  el.textContent = emoji;
  Object.assign(el.style, {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    background: "#ffffff",
    border: `3px solid ${active ? "#f57c00" : "#2e7d32"}`,
    borderRadius: "50%",
    boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
    transform: active ? "scale(1.2)" : "none",
  });
  return L.divIcon({ html: el, className: "", iconSize: [38, 38], iconAnchor: [19, 19] });
}

// Customer er nijer location (neel dot)
export function userIcon(L: Leaflet) {
  const el = document.createElement("div");
  Object.assign(el.style, {
    width: "18px",
    height: "18px",
    background: "#1a73e8",
    border: "3px solid #ffffff",
    borderRadius: "50%",
    boxShadow: "0 0 0 6px rgba(26,115,232,0.25)",
  });
  return L.divIcon({ html: el, className: "", iconSize: [18, 18], iconAnchor: [9, 9] });
}