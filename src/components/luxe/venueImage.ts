import type { ImageSourcePropType } from "react-native";

const PHOTOS = {
  hotel: require("../../../assets/images/use-cases/hotel.jpg"),
  park: require("../../../assets/images/use-cases/park.jpg"),
  cruise: require("../../../assets/images/use-cases/cruise.jpg"),
  attraction: require("../../../assets/images/use-cases/attraction.jpg"),
} as const;

/**
 * Resolve a booking's image. The API returns either a URL or a loose keyword
 * ("hayat hotel", "disney cruise", "theme park"); keywords — and missing
 * images — fall back to the bundled venue photography by venue type.
 */
export function venueImage(image?: string | null, type?: string | null): ImageSourcePropType {
  if (image && /^https?:\/\//.test(image)) return { uri: image };
  const hint = `${image ?? ""} ${type ?? ""}`.toLowerCase();
  if (hint.includes("cruise") || hint.includes("ship")) return PHOTOS.cruise;
  if (hint.includes("park") || hint.includes("theme")) return PHOTOS.park;
  if (hint.includes("museum") || hint.includes("attraction") || hint.includes("zoo") || hint.includes("event")) return PHOTOS.attraction;
  return PHOTOS.hotel;
}
