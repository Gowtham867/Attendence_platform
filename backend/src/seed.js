const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");
const Attendance = require("./models/Attendance");
const { formatDate } = require("./utils/dateUtils");

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    console.log("Clearing old data...");
    await User.deleteMany({});
    await Attendance.deleteMany({});

    console.log("Creating users...");

    const manager = await User.create({
      name: "Admin Manager",
      email: "manager@example.com",
      password: "password123",
      role: "manager",
      employeeId: "MGR001",
      department: "HR",
    });

    const emp1 = await User.create({
      name: "Employee One",
      email: "emp1@example.com",
      password: "password123",
      role: "employee",
      employeeId: "EMP001",
      department: "IT",
    });

    const emp2 = await User.create({
      name: "Employee Two",
      email: "emp2@example.com",
      password: "password123",
      role: "employee",
      employeeId: "EMP002",
      department: "Sales",
    });

    console.log("Creating sample attendance...");

    const today = new Date();

    const day1 = new Date(today);
    day1.setDate(today.getDate() - 1); // yesterday

    const day2 = new Date(today);
    day2.setDate(today.getDate() - 2); // day before

    await Attendance.create([
      {
        userId: emp1._id,
        date: formatDate(day2),
        checkInTime: new Date(day2.setHours(9, 0)),
        checkOutTime: new Date(day2.setHours(17, 0)),
        status: "present",
        totalHours: 8,
      },
      {
        userId: emp1._id,
        date: formatDate(day1),
        checkInTime: new Date(day1.setHours(9, 45)),
        checkOutTime: new Date(day1.setHours(17, 0)),
        status: "late",
        totalHours: 7.25,
      },
      {
        userId: emp2._id,
        date: formatDate(day1),
        checkInTime: new Date(day1.setHours(10, 0)),
        checkOutTime: new Date(day1.setHours(14, 0)),
        status: "half-day",
        totalHours: 4,
      },
    ]);

    console.log("Seeding done.");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
