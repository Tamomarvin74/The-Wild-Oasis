// pages/account/index.js
import { getSession } from "next-auth/react"; // Use getSession for server-side session retrieval in getServerSideProps
import { getBookings } from "../../lib/data-service"; // Correct path to data-service
import ReservationList from "../../components/ReservationList"; // Assuming this component exists

function AccountPage({ bookings, session }) {
  // Client-side rendering of the page content
  if (!session || !session.user) {
    // This client-side check is a fallback; getServerSideProps should handle redirection first.
    return <p className="text-lg text-red-500">You need to be logged in to view this page.</p>;
  }

  return (
    <div>
      <h2 className="font-semibold text-2xl text-accent-400 mb-7">
        Welcome, {session.user.name}
      </h2>

      {bookings.length === 0 ? (
        <p className="text-lg">
          You have no reservations yet. Start planning your dream vacation{" "}
          <a className="text-accent-500" href="/cabins">
            here &rarr;
          </a>
        </p>
      ) : (
        <ReservationList bookings={bookings} />
      )}
    </div>
  );
}

// getServerSideProps runs on the server for each request to this page.
export async function getServerSideProps(context) {
  console.log("DEBUG: getServerSideProps for /account page is running.");
  // Get the NextAuth session from the request context
  const session = await getSession(context);

  console.log("DEBUG getServerSideProps /account: Session received =", session);

  // If there's no session or no user in the session, redirect to the login page
  if (!session || !session.user) {
    console.log("DEBUG getServerSideProps /account: No session or user found, redirecting to /login.");
    return {
      redirect: {
        destination: "/login", // Redirect to your custom login page
        permanent: false, // Not a permanent redirect
      },
    };
  }

  // If authenticated, fetch bookings using the guestId from the session
  // Ensure session.user.guestId is correctly populated in your NextAuth callbacks (lib/auth.js)
  let bookings = [];
  try {
    console.log("DEBUG getServerSideProps /account: Attempting to fetch bookings for guestId:", session.user.guestId);
    bookings = await getBookings(session.user.guestId);
    console.log("DEBUG getServerSideProps /account: Bookings fetched successfully.");
  } catch (error) {
    console.error("ERROR getServerSideProps /account: Error fetching bookings:", error);
    // You might want to return an error message to the client or redirect to a generic error page
    return {
      props: {
        bookings: [], // Return empty array on error
        session,
        error: "Failed to load bookings. Please try again later.",
      },
    };
  }

  return {
    props: {
      bookings,
      session, // Pass the session object to the page component
    },
  };
}

export default AccountPage;
