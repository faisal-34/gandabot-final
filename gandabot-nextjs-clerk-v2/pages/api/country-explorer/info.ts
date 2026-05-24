/**
 * GET /api/country-explorer/info?country=Uganda
 *
 * Returns curated static data for the requested African country.
 * Data is served from lib/countries.ts — no external API calls, no AI generation.
 * All facts (population, capital, currency, phrases, foods, landmarks) are
 * accurate and human-curated.
 *
 * Response: CountryData | { error: string }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { getCountry, type CountryData } from "@/lib/countries";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<CountryData | { error: string }>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { country } = req.query;

  if (!country || typeof country !== "string" || !country.trim()) {
    return res.status(400).json({ error: "Query param 'country' is required" });
  }

  const data = getCountry(country);

  if (!data) {
    return res
      .status(404)
      .json({ error: `No data found for "${country}". Try one of the featured countries.` });
  }

  // Cache for 1 hour — data is static
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).json(data);
}
