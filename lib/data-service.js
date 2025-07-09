 // lib/data-service.js

import { supabase } from "./supabase";
import { eachDayOfInterval, format } from "date-fns";

export async function getCabins() {
  console.log("DEBUG data-service: Attempting to fetch cabins.");
  const { data, error } = await supabase
    .from("cabins")
    .select("id, name, MaxCapacity, regular_price, discount, image, description")
    .order("name");

  if (error) {
    console.error("Supabase Error fetching cabins:", error);
    throw new Error("Cabins could not be loaded");
  }
  console.log("DEBUG data-service: Cabins fetched successfully.");
  return data;
}

export async function getCabin(id) {
  console.log(`DEBUG data-service: Attempting to fetch cabin with ID: ${id}`);
  const { data, error } = await supabase
    .from("cabins")
    .select("id, name, MaxCapacity, regular_price, discount, image, description, created_at")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Supabase Error fetching single cabin (ID: ${id}):`, error);
    throw new Error("Cabin could not be loaded");
  }
  console.log(`DEBUG data-service: Cabin (ID: ${id}) fetched successfully.`);
  return data;
}

export async function getCabinIds() {
  console.log("DEBUG data-service: Attempting to fetch cabin IDs.");
  const { data, error } = await supabase
    .from("cabins")
    .select("id");

  if (error) {
    console.error("Supabase Error fetching cabin IDs:", error);
    throw new Error("Cabin IDs could not be loaded");
  }
  console.log("DEBUG data-service: Cabin IDs fetched successfully.");
  return data;
}

export async function getBookings(guestId) {
  console.log(`DEBUG data-service: Attempting to fetch bookings for guest ID: ${guestId}`);
  const { data, error } = await supabase
    .from("bookings")
    .select("id, created_at, startDate, endDate, numNights, numGuests, totalPrice, guestId, cabinId(name, image)")
    .eq("guestId", guestId)
    .order("startDate");

  if (error) {
    console.error(`Supabase Error fetching bookings for guest ID ${guestId}:`, error);
    throw new Error("Bookings could not be loaded");
  }
  console.log(`DEBUG data-service: Bookings for guest ID ${guestId} fetched successfully.`);
  return data;
}

export async function createGuest(newGuest) {
  console.log("DEBUG data-service: Attempting to create new guest:", newGuest);
  const { data, error } = await supabase
    .from("guests")
    .insert([newGuest])
    .select()
    .single();

  if (error) {
    console.error("Supabase Error creating guest:", error);
    throw new Error("Guest could not be created");
  }
  console.log("DEBUG data-service: Guest created successfully:", data);
  return data;
}

export async function getGuest(email) {
  console.log(`DEBUG data-service: Attempting to get guest with email: ${email}`);
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      console.log(`DEBUG data-service: No guest found with email: ${email}`);
      return null;
    }
    console.error(`Supabase Error getting guest with email ${email}:`, error);
    throw new Error("Guest could not be loaded");
  }
  console.log(`DEBUG data-service: Guest with email ${email} found:`, data);
  return data;
}

export async function updateGuest(guestId, updatedFields) {
  console.log(`DEBUG data-service: Attempting to update guest ID: ${guestId} with fields:`, updatedFields);
  const { data, error } = await supabase
    .from("guests")
    .update(updatedFields)
    .eq("id", guestId)
    .select()
    .single();

  if (error) {
    console.error(`Supabase Error updating guest ID ${guestId}:`, error);
    throw new Error("Guest could not be updated");
  }
  console.log(`DEBUG data-service: Guest ID ${guestId} updated successfully:`, data);
  return data;
}

export async function createBooking(newBooking) {
  console.log("DEBUG data-service: Attempting to create new booking:", newBooking);
  const { data, error } = await supabase
    .from("bookings")
    .insert([newBooking])
    .select()
    .single();

  if (error) {
    console.error("Supabase Error creating booking:", error);
    throw new Error("Booking could not be created");
  }
  console.log("DEBUG data-service: Booking created successfully:", data);
  return data;
}

export async function deleteBooking(bookingId) {
  console.log(`DEBUG data-service: Attempting to delete booking ID: ${bookingId}`);
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    console.error(`Supabase Error deleting booking ID ${bookingId}:`, error);
    throw new Error("Booking could not be deleted");
  }
  console.log(`DEBUG data-service: Booking ID ${bookingId} deleted successfully.`);
  return null;
}

export async function updateBooking(bookingId, updatedFields) {
  console.log(`DEBUG data-service: Attempting to update booking ID: ${bookingId} with fields:`, updatedFields);
  const { data, error } = await supabase
    .from("bookings")
    .update(updatedFields)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    console.error(`Supabase Error updating booking ID ${bookingId}:`, error);
    throw new Error("Booking could not be updated");
  }
  console.log(`DEBUG data-service: Booking ID ${bookingId} updated successfully:`, data);
  return data;
}

export async function getSettings() {
  console.log("DEBUG data-service: Attempting to get settings.");
  const { data, error } = await supabase.from("settings").select("*").single();

  if (error) {
    console.error("Supabase Error getting settings:", error);
    throw new Error("Settings could not be loaded");
  }
  console.log("DEBUG data-service: Settings fetched successfully:", data);
  return data;
}

export async function getBookedDatesByCabinId(cabinId) {
  console.log(`DEBUG data-service: Attempting to get booked dates for cabin ID: ${cabinId}`);
  const { data, error } = await supabase
    .from("bookings")
    .select("startDate, endDate")
    .eq("cabinId", cabinId)
    .or("status.eq.unconfirmed,status.eq.checked-in");

  if (error) {
    console.error(`Supabase Error getting booked dates for cabin ID ${cabinId}:`, error);
    throw new Error("Booked dates could not be loaded");
  }
  console.log(`DEBUG data-service: Booked dates for cabin ID ${cabinId} fetched successfully.`);
  const bookedDates = data.flatMap((booking) =>
    eachDayOfInterval({
      start: new Date(booking.startDate),
      end: new Date(booking.endDate),
    }).map((date) => format(date, "yyyy-MM-dd"))
  );

  return bookedDates;
}
