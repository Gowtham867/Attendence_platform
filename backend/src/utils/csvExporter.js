// Convert attendance records to CSV string
const attendanceToCSV = (records = []) => {
  const headers = [
    "Employee Name",
    "Employee ID",
    "Department",
    "Date",
    "Status",
    "Check In",
    "Check Out",
    "Total Hours",
  ];

  const rows = records.map((rec) => {
    const user = rec.userId || {};
    return [
      user.name || "",
      user.employeeId || "",
      user.department || "",
      rec.date || "",
      rec.status || "",
      rec.checkInTime ? new Date(rec.checkInTime).toISOString() : "",
      rec.checkOutTime ? new Date(rec.checkOutTime).toISOString() : "",
      rec.totalHours != null ? rec.totalHours.toFixed(2) : "",
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
};

module.exports = { attendanceToCSV };
