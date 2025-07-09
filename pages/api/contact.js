 // pages/api/contact.js

import { supabase } from "../../lib/supabase"; // Ensure this path is correct

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // req.body is already parsed by Next.js's built-in body parser
    // when Content-Type is 'application/json'.
    // This line was causing the SyntaxError because req.body was already an object.
    const contactData = req.body; // <--- CORRECTED: Removed JSON.parse(req.body)

    // Validate incoming data (optional but recommended)
    if (!contactData.fullName || !contactData.email || !contactData.subject || !contactData.message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Attempt to insert data into Supabase
    const { error } = await supabase.from("contact").insert([contactData]);

    if (error) {
      // Log the full Supabase error object for detailed debugging
      console.error("Supabase error inserting contact data:", error);
      return res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
    }

    return res.status(200).json({ success: true, message: "Message sent successfully!" });

  } catch (parseError) {
    // This catch block should now primarily handle unexpected errors,
    // not the JSON parsing error if the above fix is applied.
    console.error("Error processing contact form submission:", parseError);
    return res.status(500).json({ success: false, message: "An unexpected error occurred on the server." });
  }
}