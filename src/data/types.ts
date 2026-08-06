export type CountryCode =
  | "UA"
  | "GB"
  | "US"
  | "MX"
  | "JP"
  | "RU"
  | "CA"
  | "CN"
  | "NZ"
  | "PR"
  | "UZ"
  | "CO"
  | "CU"
  | "PH"
  | "ZA"
  | "AU"
  | "AR"
  | "DO"
  | "KZ"
  | "SA"
  | "FR"
  | "SE"
  | "RO"
  | "IE"
  | "NI"
  | "TH";

export interface FighterRecord {
  wins: number;
  losses: number;
  draws: number;
  kos: number;
}

export interface FightResult {
  opponent: string;
  result: "W" | "L" | "D" | "NC";
  method: string;
  round: string;
  date: string;
  venue: string;
  title?: string;
}

export interface Fighter {
  id: string;
  name: string;
  nickname: string;
  country: CountryCode;
  flagLabel: string;
  division: string;
  record: FighterRecord;
  age: number;
  birthDate: string;
  heightCm: number;
  heightFt: string;
  reachCm: number;
  reachIn: string;
  stance: "Orthodox" | "Southpaw" | "Switch";
  currentWeightKg?: string;
  image: string;
  imageAlt?: string;
  rank: number;
  status: "Champion" | "Verified" | "Contender" | "Former Champion";
  titles: string[];
  lastFight: FightResult;
  nextFight?: {
    opponent: string;
    date: string;
    venue: string;
    titles: string;
  } | null;
  skills: {
    power: number;
    speed: number;
    defense: number;
    stamina: number;
    ringIq: number;
    chin: number;
  };
  shortBio: string;
  birthplace: string;
  residence: string;
  trainer: string;
  promoter: string;
  manager: string;
  gym: string;
  roundsBoxed: number;
  debut: string;
  koPercent: number;
  weightClassLimit: string;
  instagram?: string;
  twitter?: string;
}

export interface CardFight {
  bout: string;
  fighters: string;
  division: string;
  titles?: string;
  status?: "Main Event" | "Champion" | "Co-Main" | "Undercard";
}

export interface BoxingEvent {
  id: string;
  title: string;
  headline: string;
  fighterA: string;
  fighterB: string;
  flagA?: CountryCode;
  flagB?: CountryCode;
  imageA?: string;
  imageB?: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  venueImage: string;
  posterImage: string;
  weightClass: string;
  titles: string[];
  promoter: string;
  broadcaster: string;
  referee: string;
  judges: string[];
  expectedAttendance: string;
  status: "Live" | "Tickets" | "Sellout" | "Upcoming" | "Completed";
  ticketStatus: string;
  priceFrom: string;
  timezone: string;
  coMain?: string;
  card: CardFight[];
}

export interface RankingRow {
  name: string;
  country: CountryCode;
  record: string;
  kos: number;
  points: number;
  movement: "up" | "down" | "same";
  status: "Champion" | "Interim" | "Contender";
  lastFight: string;
  nextFight: string;
}

export interface DivisionRanking {
  division: string;
  limit: string;
  champion: string;
  rows: RankingRow[];
}

export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  breaking?: boolean;
  featured?: boolean;
  excerpt: string;
  image: string;
  publishedAt: string;
  readMinutes: number;
  author: string;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  views: number;
  likes: number;
  publishedAt: string;
  featured?: boolean;
  category: string;
  image: string;
  tags: string[];
}

export type TicketStatus = "active" | "used" | "pending" | "refunded";

export interface TicketItem {
  id: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  undercard: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  gateOpen: string;
  section: string;
  row: string;
  seat: string;
  price: number;
  qr: string;
  status: TicketStatus;
  purchasedAt: string;
}

export interface Legend {
  name: string;
  country: CountryCode;
  era: string;
  record: string;
  legacy: string;
  image: string;
}

export interface PodcastEpisode {
  title: string;
  guest: string;
  duration: string;
  date: string;
}
