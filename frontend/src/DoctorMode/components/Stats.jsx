function Stats() {
    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Appointments</h2>
            <p className="text-3xl font-bold">1275</p>
          </div>
          <div className="text-blue-500 text-3xl">📅</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Patients</h2>
            <p className="text-3xl font-bold">1138</p>
          </div>
          <div className="text-green-500 text-3xl">👥</div>
        </div>
      </div>
    );
  }
  
  export default Stats;
  