// components/ReservationList.js
// This is a placeholder component. Replace with your actual ReservationList implementation.

function ReservationList({ bookings }) {
  if (!bookings || bookings.length === 0) {
    return <p className="text-lg text-primary-200">No reservations found.</p>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-accent-400 mb-4">Your Reservations</h3>
      <ul className="space-y-4">
        {bookings.map((booking) => (
          <li key={booking.id} className="bg-primary-800 p-4 rounded-lg shadow-md">
            <p className="text-primary-100">Cabin: {booking.cabinId?.name || 'N/A'}</p>
            <p className="text-primary-200">Dates: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
            <p className="text-primary-200">Guests: {booking.numGuests}</p>
            <p className="text-primary-200">Total Price: ${booking.totalPrice}</p>
            {/* Add more booking details as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReservationList;
