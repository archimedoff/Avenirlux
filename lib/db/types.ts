export type ConciergePreferences = {
  contactChannel: "email" | "phone" | "whatsapp";
  preferredLanguage: string;
  dietaryNotes?: string;
  transportNotes?: string;
};

export type UserProfile = {
  phone?: string;
  country?: string;
};

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  profile: UserProfile;
  conciergePreferences: ConciergePreferences;
};

export type BookingStatus = "upcoming" | "completed" | "cancelled";

export type UserBookingRecord = {
  id: string;
  userId: string;
  confirmationRef: string;
  status: BookingStatus;
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomName: string;
  total: number;
  createdAt: string;
};

export type PublicUser = Omit<UserRecord, "passwordHash">;
