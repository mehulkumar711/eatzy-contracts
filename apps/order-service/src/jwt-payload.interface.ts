// This is a shared type, but we will duplicate it for now
// to avoid the circular dependency you (incorrectly) flagged.
export interface JwtPayload {
  userId: string;
  phone: string;
  role: string;
}