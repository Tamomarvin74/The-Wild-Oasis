 import { useState } from "react";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    // Prepare data
    const formData = new FormData(e.target);
    const contactData = Object.fromEntries(formData.entries());

    // POST request
    setIsSubmitting(true);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json' // Important: Specify content type for JSON body
      },
      body: JSON.stringify(contactData),
    });

    // Get result
    const { success: responseSuccess, message: responseMessage } = await response.json(); // Renamed to avoid conflicts

    // Set state
    setMessage(responseMessage);
    setSuccess(responseSuccess);
    setIsSubmitting(false);
  }

  return (
    <div>
      <h1 className="text-4xl mb-8 text-accent-400 font-medium">
        Any question? Shoot us a message
      </h1>

      {success === true ? (
        <p className="text-center text-lg text-primary-100">{message}</p> // Ensure success message is also white
      ) : (
        <form
          className="bg-primary-900 py-10 px-14 text-lg space-y-6 max-w-5xl mx-auto"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <label className="text-primary-100">Full name</label>
            <input
              required
              className="px-5 py-3 bg-primary-900 text-primary-100 w-full shadow-sm rounded-sm border border-primary-700 focus:outline-none focus:ring-2 focus:ring-accent-500" // Changed bg-primary-200 to bg-primary-900 and text-primary-800 to text-primary-100
              name="fullName"
            />
          </div>

          <div className="space-y-2">
            <label className="text-primary-100">Email address</label>
            <input
              type="email"
              name="email"
              required
              className="px-5 py-3 bg-primary-900 text-primary-100 w-full shadow-sm rounded-sm border border-primary-700 focus:outline-none focus:ring-2 focus:ring-accent-500" // Changed bg-primary-200 to bg-primary-900 and text-primary-800 to text-primary-100
            />
          </div>

          <div className="space-y-2">
            <label className="text-primary-100">Subject</label>
            <select
              required
              name="subject"
              className="px-5 py-3 bg-primary-900 text-primary-100 w-full shadow-sm rounded-sm border border-primary-700 focus:outline-none focus:ring-2 focus:ring-accent-500" // Changed bg-primary-200 to bg-primary-900 and text-primary-800 to text-primary-100
            >
              <option value="">Select subject...</option>
              <option value="booking-enquiry">Booking enquiry</option>
              <option value="cabin-information">Cabin information</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-primary-100">Message</label>
            <textarea
              name="message"
              className="px-5 py-3 bg-primary-900 text-primary-100 w-full shadow-sm rounded-sm border border-primary-700 focus:outline-none focus:ring-2 focus:ring-accent-500" // Changed bg-primary-200 to bg-primary-900 and text-primary-800 to text-primary-100
              rows={3}
              required
            />
          </div>

          <div className="flex justify-between items-center text-red-500">
            {!success && message ? <p>{message}</p> : <p></p>}

            <button
              className="bg-accent-500 px-8 py-4 text-primary-800 font-semibold hover:bg-accent-600 transition-all disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send message"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
