export type RideStatus = "available" | "full" | "lastSeats";

export type Ride = {
  id: string;
  origin: string;
  destination: string;
  dateLabel: string;
  departureTime: string;
  seatsLeft: number;
  priceUyu: number;
  driverName: string;
  driverRating: number;
  driverTrips: number;
  carModel: string;
  status: RideStatus;
  tags: string[];
};

export type Conversation = {
  id: string;
  riderName: string;
  role: "driver" | "passenger";
  route: string;
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  route: string;
  body: string;
};

export type ModerationCase = {
  id: string;
  subject: string;
  reason: string;
  severity: "low" | "medium" | "high";
  openedAt: string;
  status: "review" | "escalated" | "closed";
};

export type TrustMetric = {
  label: string;
  value: string;
  detail: string;
};

export type ProductPillar = {
  title: string;
  description: string;
};

export type PassengerScoreBand = "trusted" | "watch" | "blocked";

export type PassengerScoreCard = {
  id: string;
  name: string;
  score: number;
  band: PassengerScoreBand;
  completedTrips: number;
  cancellationRate: string;
  noShowCount: number;
  reportsCount: number;
  note: string;
};