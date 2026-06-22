import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { Booking, Review, Room } from "../types";
import { sendBookingNotifications, sendBookingStatusEmail } from "./email";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

const firebaseApp = hasFirebaseConfig
  ? getApps().length > 0
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
export const storage = firebaseApp ? getStorage(firebaseApp) : null;

export const isFirebaseConfigured = Boolean(firebaseApp && auth && db);

export const DEFAULT_ROOMS: Room[] = [
  {
    id: "budget-room",
    name: "Budget Room",
    description: "A smart, wallet-friendly option with all essential comforts.",
    pricePerNight: 10000,
    capacity: 2,
    amenities: ["Air Conditioning", "Private Bathroom", "Flat-screen TV"],
    image: "/images/budget-1.jpeg",
    images: [
      "/images/budget-1.jpeg",
      "/images/budget-2.jpg",
      "/images/budget-3.jpg",
      "/images/toilet.jpeg",
    ],
  },
  {
    id: "double",
    name: "Double Room",
    description: "A comfortable Double room with simple, welcoming décor.",
    pricePerNight: 12000,
    capacity: 2,
    amenities: ["Double Bed", "Air Conditioning", "Mini Fridge"],
    image: "/images/double-1.jpeg",
    images: [
      "/images/double-1.jpeg",
      "/images/double-2.jpeg",
      "/images/double-3.jpeg",
      "/images/toilet.jpeg",
    ],
  },
  {
    id: "queen-room",
    name: "Queen Room",
    description: "A refined Queen room with tasteful finishes and a warm ambience.",
    pricePerNight: 16000,
    capacity: 2,
    amenities: ["Queen Bed", "Air Conditioning", "Smart TV"],
    image: "/images/queen-1.jpg",
    images: [
      "/images/queen-1.jpg",
      "/images/queen-2.jpg",
      "/images/queen-3.jpg",
      "/images/toilet.jpeg",
    ],
  },
  {
    id: "deluxe",
    name: "Deluxe Suite",
    description: "A bright and generously sized Deluxe room offering upgraded comfort.",
    pricePerNight: 25000,
    capacity: 3,
    amenities: ["King Bed", "Private Balcony", "Premium Bathroom"],
    image: "/images/deluxe-1.jpeg",
    images: [
      "/images/deluxe-1.jpeg",
      "/images/deluxe-2.jpg",
      "/images/deluxe-3.jpg",
      "/images/toilet.jpeg",
    ],
  },
];

export const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev-1",
    author: "Bamidele S",
    location: "Ibadan, Nigeria",
    rating: 4,
    comment:
      "Amazing security and privacy. The Budget room was compact but well designed. Will definitely return.",
    bookingId: "GHR-MOCKSEED3",
    approved: true,
    date: "2026-05-26",
  },
];

function normalizeRoom(room: any): Room {
  return {
    id: room.id,
    name: room.name || "Room",
    description: room.description || "",
    pricePerNight: Number(room.pricePerNight || 0),
    capacity: Number(room.capacity || 1),
    amenities: Array.isArray(room.amenities) ? room.amenities : [],
    image: room.image || (Array.isArray(room.images) ? room.images[0] : ""),
    images: Array.isArray(room.images) ? room.images : room.image ? [room.image] : [],
  };
}

function normalizeReview(review: any): Review {
  return {
    id: review.id,
    author: review.author || "",
    location: review.location || "",
    rating: Number(review.rating || 0),
    comment: review.comment || "",
    bookingId: review.bookingId || "",
    approved: Boolean(review.approved),
    date: review.date || new Date().toISOString().split("T")[0],
  };
}

function normalizeBooking(booking: any): Booking {
  return {
    id: booking.id,
    roomId: booking.roomId,
    roomName: booking.roomName || "",
    checkIn: booking.checkIn || "",
    checkOut: booking.checkOut || "",
    guests: Number(booking.guests || 0),
    nights: booking.nights,
    totalPrice: Number(booking.totalPrice || 0),
    status: booking.status || "confirmed",
    createdAt: booking.createdAt,
    customer: {
      firstName: booking.customer?.firstName || "",
      lastName: booking.customer?.lastName || "",
      email: booking.customer?.email || "",
      phone: booking.customer?.phone || "",
      passportNumber: booking.customer?.passportNumber || "",
    },
  };
}

function requireFirestore() {
  if (!db) {
    throw new Error(
      "Firebase Firestore is not configured. Add your Firebase settings to the .env file."
    );
  }
}

export async function getRooms(): Promise<Room[]> {
  if (!db) {
    console.info("Firebase not configured; using default room data.");
    return DEFAULT_ROOMS;
  }
  try {
    const snapshot = await getDocs(collection(db, "rooms"));
    const rooms = snapshot.docs.map((docSnap) =>
      normalizeRoom({ id: docSnap.id, ...docSnap.data() })
    );
    if (rooms.length > 0) {
      console.info("Loaded rooms from Firestore.");
      return rooms;
    }
    console.info("Firestore rooms collection is empty; using default room data.");
    return DEFAULT_ROOMS;
  } catch (error) {
    console.warn("Failed to load rooms from Firestore, using default room data.", error);
    return DEFAULT_ROOMS;
  }
}

export async function getApprovedReviews(): Promise<Review[]> {
  if (!db) {
    console.info("Firebase not configured; using default review data.");
    return DEFAULT_REVIEWS;
  }
  try {
    const snapshot = await getDocs(collection(db, "reviews"));
    const reviews = snapshot.docs
      .map((docSnap) => normalizeReview({ id: docSnap.id, ...docSnap.data() }))
      .filter((review) => review.approved)
      .sort((a, b) => (b.date > a.date ? 1 : -1));
    if (reviews.length > 0) {
      console.info("Loaded approved reviews from Firestore.");
      return reviews;
    }
    console.info("No approved reviews found; using default review data.");
    return DEFAULT_REVIEWS;
  } catch (error) {
    console.warn("Failed to load reviews from Firestore, using default review data.", error);
    return DEFAULT_REVIEWS;
  }
}

export async function submitReview(payload: {
  author: string;
  location: string;
  rating: number;
  comment: string;
  bookingId: string;
}) {
  requireFirestore();
  const id = `rev-${Date.now()}`;
  await setDoc(doc(db!, "reviews", id), {
    ...payload,
    approved: false,
    date: new Date().toISOString().split("T")[0],
  });
  return { success: true, id };
}

export async function createBooking(payload: {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  customer: any;
}) {
  requireFirestore();
  const rooms = await getRooms();
  const selectedRoom = rooms.find((item) => item.id === payload.roomId);
  if (!selectedRoom) {
    throw new Error("Selected room does not exist.");
  }

  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(payload.checkOut).getTime() - new Date(payload.checkIn).getTime()) /
        86_400_000
    )
  );
  const totalPrice = nights * selectedRoom.pricePerNight;
  const bookingId = `GHR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const bookingPayload = {
    id: bookingId,
    roomId: payload.roomId,
    roomName: selectedRoom.name,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    guests: Number(payload.guests || 1),
    nights,
    totalPrice,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    customer: {
      firstName: payload.customer.firstName,
      lastName: payload.customer.lastName,
      email: payload.customer.email,
      phone: `${payload.customer.phoneAreaCode || ""} ${(
        payload.customer.phone || ""
      ).replace(/[\s()\-]/g, "")}`.trim(),
      passportNumber: payload.customer.passportNumber,
    },
  };

  await setDoc(doc(db!, "bookings", bookingId), bookingPayload);

  try {
    await sendBookingNotifications(bookingPayload);
  } catch (error) {
    console.warn("Booking notifications could not be sent.", error);
  }

  return {
    ...bookingPayload,
    payAtHotel: true,
    paymentInstructions: "Please pay at the hotel on arrival. We accept cash and card.",
  };
}

export async function searchBooking(reference: string, lastName: string) {
  requireFirestore();
  const snapshot = await getDoc(doc(db!, "bookings", reference));
  if (!snapshot.exists()) {
    throw new Error("No reservation found with this reference.");
  }
  const booking = normalizeBooking({ id: snapshot.id, ...snapshot.data() });
  if (booking.customer.lastName.toLowerCase() !== lastName.trim().toLowerCase()) {
    throw new Error("Last name does not match this reservation.");
  }
  return booking;
}

export async function cancelBooking(reference: string, lastName: string) {
  requireFirestore();
  const docRef = doc(db!, "bookings", reference);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    throw new Error("Reservation not found.");
  }
  const booking = normalizeBooking({ id: snapshot.id, ...snapshot.data() });
  if (booking.customer.lastName.toLowerCase() !== lastName.trim().toLowerCase()) {
    throw new Error("Last name does not match this reservation.");
  }

  await updateDoc(docRef, { status: "cancelled" });

  try {
    await sendBookingStatusEmail({ ...booking, status: "cancelled" }, "cancelled");
  } catch (error) {
    console.warn("Failed to send cancellation email for guest booking.", error);
  }

  return { success: true };
}

export async function getAdminBookings(): Promise<Booking[]> {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "bookings"));
  return snapshot.docs.map((docSnap) =>
    normalizeBooking({ id: docSnap.id, ...docSnap.data() })
  );
}

export async function updateAdminBooking(id: string, changes: Partial<Booking>) {
  requireFirestore();
  const docRef = doc(db!, "bookings", id);
  const currentDoc = await getDoc(docRef);
  if (!currentDoc.exists()) {
    throw new Error("Booking not found.");
  }

  const currentData = currentDoc.data();
  const oldStatus = currentData.status || "confirmed";

  if (changes.customer) {
    changes.customer = { ...currentData.customer, ...changes.customer };
  }

  await updateDoc(docRef, changes as any);

  const updatedBooking = normalizeBooking({ id, ...currentData, ...changes });

  try {
    if (changes.status === "checked-in") {
      await sendBookingStatusEmail(updatedBooking, "checked-in");
    } else if (changes.status === "cancelled") {
      await sendBookingStatusEmail(updatedBooking, "cancelled");
    } else if (oldStatus !== updatedBooking.status) {
      await sendBookingStatusEmail(updatedBooking, "amendment");
    } else {
      await sendBookingStatusEmail(updatedBooking, "amendment");
    }
  } catch (error) {
    console.warn("Failed to send booking update email after admin amendment.", error);
  }
}

export async function deleteAdminBooking(id: string) {
  requireFirestore();
  const docRef = doc(db!, "bookings", id);
  const currentDoc = await getDoc(docRef);
  if (!currentDoc.exists()) {
    throw new Error("Booking not found.");
  }

  const booking = normalizeBooking({ id, ...currentDoc.data() });
  await deleteDoc(docRef);

  try {
    await sendBookingStatusEmail({ ...booking, status: "cancelled" }, "cancelled");
  } catch (error) {
    console.warn("Failed to send cancellation email after admin deletion.", error);
  }
}

export async function createAdminBooking(payload: {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  customer: any;
}) {
  return createBooking(payload);
}

export async function getAdminReviews(): Promise<Review[]> {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "reviews"));
  return snapshot.docs.map((docSnap) =>
    normalizeReview({ id: docSnap.id, ...docSnap.data() })
  );
}

export async function approveReview(id: string) {
  requireFirestore();
  await updateDoc(doc(db!, "reviews", id), { approved: true });
}

export async function deleteReview(id: string) {
  requireFirestore();
  await deleteDoc(doc(db!, "reviews", id));
}

export async function getAdminRooms(): Promise<Room[]> {
  return getRooms();
}

export async function saveRoom(room: Room) {
  requireFirestore();
  await setDoc(doc(db!, "rooms", room.id), room);
}

export async function updateRoom(id: string, changes: Partial<Room>) {
  requireFirestore();
  await updateDoc(doc(db!, "rooms", id), changes as any);
}

export async function deleteRoom(id: string) {
  requireFirestore();
  await deleteDoc(doc(db!, "rooms", id));
}

export async function signInAdmin(email: string, password: string) {
  if (!auth) {
    throw new Error("Firebase Authentication is not configured.");
  }
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOutAdmin() {
  if (!auth) return;
  await signOut(auth);
}
