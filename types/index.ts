export interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  image: string;
  images?: string[];
}

export interface CustomerForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneAreaCode: string;
  phone: string;
  idType: "passport" | "nin";
  passportNumber: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights?: number;
  totalPrice: number;
  status: "confirmed" | "checked-in" | "cancelled";
  createdAt?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    passportNumber: string;
    creditCardCardholder?: string;
    creditCardNumber?: string;
    creditCardExpiry?: string;
  };
  encryptedFields?: Record<string, string>;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  comment: string;
  bookingId: string;
  approved: boolean;
  date: string;
}

export interface AdminStats {
  totalBookings: number;
  totalRevenue: number;
  activeGuests: number;
  occupancyRate: number;
}
