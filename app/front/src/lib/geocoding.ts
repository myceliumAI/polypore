/**
 * Geocoding utilities using Photon API (Komoot).
 */

type GeocodingResult = {
  lat: number;
  lng: number;
};

/**
 * Geocode an address to coordinates using Photon API.
 *
 * :param str address: Address to geocode
 * :return Promise<GeocodingResult | null>: Coordinates or null if not found
 */
export async function geocodeAddress(
  address: string,
): Promise<GeocodingResult | null> {
  if (!address || address.trim() === "") {
    return null;
  }

  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`,
    );

    if (!response.ok) {
      console.error("Geocoding failed:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      return { lat, lng };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Batch geocode multiple addresses.
 *
 * :param str[] addresses: Addresses to geocode
 * :return Promise<(GeocodingResult | null)[]>: Array of coordinates (null for failed geocoding)
 */
export async function batchGeocode(
  addresses: string[],
): Promise<(GeocodingResult | null)[]> {
  // Add a small delay between requests to avoid rate limiting
  const results: (GeocodingResult | null)[] = [];

  for (const address of addresses) {
    const result = await geocodeAddress(address);
    results.push(result);

    // Wait 100ms between requests
    if (addresses.indexOf(address) < addresses.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}
