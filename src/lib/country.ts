import type { CountryCode } from "@/data/types";

const names: Record<CountryCode, string> = {
  UA: "Ukraine",
  GB: "United Kingdom",
  US: "United States",
  MX: "Mexico",
  JP: "Japan",
  RU: "Russia",
  CA: "Canada",
  CN: "China",
  NZ: "New Zealand",
  PR: "Puerto Rico",
  UZ: "Uzbekistan",
  CO: "Colombia",
  CU: "Cuba",
  PH: "Philippines",
  ZA: "South Africa",
  AU: "Australia",
  AR: "Argentina",
  DO: "Dominican Republic",
  KZ: "Kazakhstan",
  SA: "Saudi Arabia",
  FR: "France",
  SE: "Sweden",
  RO: "Romania",
  IE: "Ireland",
  NI: "Nicaragua",
  TH: "Thailand",
};

export function flagEmoji(code: CountryCode | string): string {
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))
  );
}

export function countryName(code: CountryCode | string): string {
  return names[code as CountryCode] ?? code;
}

export function formatRecord(record: {
  wins: number;
  losses: number;
  draws: number;
  kos: number;
}) {
  return `${record.wins}-${record.losses}-${record.draws} (${record.kos} KO)`;
}
