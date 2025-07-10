 // app/_lib/data-service.js

import { supabase } from "./supabase";
import { notFound } from "next/navigation";
import { eachDayOfInterval, format } from "date-fns";

// Function to get all cabins
export async function getCabins() {
  const { data, error } = await supabase
    .from("cabins")
    // IMPORTANT: These column names MUST EXACTLY match your Supabase table (case-sensitive)
    .select("id, name, MaxCapacity, regular_price, discount, image, description, bedrooms, bathrooms, beds")
    .order("name");

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }

  return data;
}

// Function to get a specific cabin by ID
export async function getCabin(id) {
  const { data, error } = await supabase
    .from("cabins")
    // IMPORTANT: These column names MUST EXACTLY match your Supabase table (case-sensitive)
    .select("id, name, MaxCapacity, regular_price, discount, image, description, bedrooms, bathrooms, beds, created_at")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    notFound();
  }

  return data;
}

// Function to get all cabin IDs (for static paths)
export async function getCabinIds() {
  const { data, error } = await supabase
    .from("cabins")
    .select("id");

  if (error) {
    console.error(error);
    throw new Error("Cabin IDs could not be loaded");
  }

  return data;
}

// Function to get bookings for a guest
export async function getBookings(guestId) {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, created_at, startDate, endDate, numNights, numGuests, totalPrice, guestId, cabinId(name, image)")
    .eq("guestId", guestId)
    .order("startDate");

  if (error) {
    console.error(error);
    throw new Error("Bookings could not be loaded");
  }

  return data;
}

// Function to create a new guest
export async function createGuest(newGuest) {
  const { data, error } = await supabase
    .from("guests")
    .insert([newGuest])
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Guest could not be created");
  }

  return data;
}

// Function to get a guest by email
export async function getGuest(email) {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error(error);
    throw new Error("Guest could not be loaded");
  }

  return data;
}

// Function to update a guest
export async function updateGuest(guestId, updatedFields) {
  const { data, error } = await supabase
    .from("guests")
    .update(updatedFields)
    .eq("id", guestId)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }

  return data;
}

// Function to create a new booking (moved to actions.js if it's a Server Action)
// Kept here if it's a utility function called by a Server Action.
// export async function createBooking(newBooking) { /* ... */ }


// Function to delete a booking (assuming this is also in data-service)
// If deleteBooking is meant to be a Server Action, it should be in actions.js
// If it's a utility function called by a Server Action, it's fine here.
export async function deleteBooking(bookingId) {
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }

  return null;
}

// Function to update a booking
export async function updateBooking(bookingId, updatedFields) {
  const { data, error } = await supabase
    .from("bookings")
    .update(updatedFields)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }

  return data;
}

// Function to get application settings (e.g., min/max booking length)
export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*").single();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }

  return data;
}

// Function to get booked dates for a specific cabin
export async function getBookedDatesByCabinId(cabinId) {
  const { data, error } = await supabase
    .from("bookings")
    .select("startDate, endDate")
    .eq("cabinId", cabinId)
    .or("status.eq.unconfirmed,status.eq.checked-in"); // Only consider unconfirmed or checked-in bookings

  if (error) {
    console.error(error);
    throw new Error("Booked dates could not be loaded");
  }

  const bookedDates = data.flatMap((booking) =>
    eachDayOfInterval({
      start: new Date(booking.startDate),
      end: new Date(booking.endDate),
    }).map((date) => format(date, "yyyy-MM-dd"))
  );

  return bookedDates;
}
