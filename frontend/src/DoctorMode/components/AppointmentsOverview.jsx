function AppointmentsOverview() {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div className="col-span-2 bg-white p-4 shadow rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Schedule</h2>
        {/* Sample data */}
        <ul>
          {Array(6).fill(0).map((_, index) => (
            <li key={index} className="mb-2">
              Facility {index + 1} - Schedule on MM/DD/YY at HH:MM to HH:MM
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="bg-white p-4 shadow rounded-lg mb-4">
          <h2 className="text-lg font-semibold">Upcoming Bookings</h2>
          <ul>
            <li>Booking 1</li>
            <li>Booking 2</li>
          </ul>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <h2 className="text-lg font-semibold">Completed Bookings</h2>
          <ul>
            <li>Booking A</li>
            <li>Booking B</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AppointmentsOverview;
