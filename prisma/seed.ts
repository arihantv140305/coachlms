import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  const adminPwd = await bcrypt.hash("Admin@123", 12);
  const testPwd = await bcrypt.hash("Test@1234", 12);

  // --- Admin ---
  const admin = await prisma.user.upsert({
    where: { email: "admin@coachlms.com" },
    update: {},
    create: { email: "admin@coachlms.com", name: "Admin User", passwordHash: adminPwd, role: "ADMIN", isActive: true, emailVerified: true },
  });

  // --- Instructors ---
  const inst1 = await prisma.user.upsert({
    where: { email: "rajesh.sharma@coachlms.com" },
    update: {},
    create: { email: "rajesh.sharma@coachlms.com", name: "Rajesh Sharma", passwordHash: testPwd, role: "INSTRUCTOR", isActive: true, phone: "9876543210" },
  });
  const inst2 = await prisma.user.upsert({
    where: { email: "priya.mehta@coachlms.com" },
    update: {},
    create: { email: "priya.mehta@coachlms.com", name: "Priya Mehta", passwordHash: testPwd, role: "INSTRUCTOR", isActive: true, phone: "9876543211" },
  });

  // --- Students ---
  const studentData = [
    { name: "Aarav Patel", email: "aarav.patel@coachlms.com" },
    { name: "Ananya Singh", email: "ananya.singh@coachlms.com" },
    { name: "Vihaan Kumar", email: "vihaan.kumar@coachlms.com" },
    { name: "Diya Gupta", email: "diya.gupta@coachlms.com" },
    { name: "Arjun Reddy", email: "arjun.reddy@coachlms.com" },
    { name: "Ishita Joshi", email: "ishita.joshi@coachlms.com" },
    { name: "Rohan Desai", email: "rohan.desai@coachlms.com" },
    { name: "Kavya Nair", email: "kavya.nair@coachlms.com" },
  ];

  const students = [];
  for (const s of studentData) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { email: s.email, name: s.name, passwordHash: testPwd, role: "STUDENT", isActive: true },
    });
    students.push(student);
  }

  // --- Courses ---
  const mathCourse = await prisma.course.upsert({
    where: { code: "MATH-1234" },
    update: {},
    create: {
      title: "Mathematics Grade 12", code: "MATH-1234", joinCode: "MTH25A",
      description: "Complete mathematics course covering calculus, algebra, and geometry for grade 12 students.",
      status: "ACTIVE", createdById: inst1.id, maxStudents: 30,
      startDate: new Date("2025-04-01"), endDate: new Date("2025-12-31"),
    },
  });

  const physicsCourse = await prisma.course.upsert({
    where: { code: "PHYS-2025" },
    update: {},
    create: {
      title: "Physics Grade 12", code: "PHYS-2025", joinCode: "PHY25M",
      description: "Comprehensive physics course covering mechanics, optics, electromagnetism, and modern physics.",
      status: "ACTIVE", createdById: inst1.id, maxStudents: 25,
      startDate: new Date("2025-04-01"), endDate: new Date("2025-12-31"),
    },
  });

  const chemCourse = await prisma.course.upsert({
    where: { code: "CHEM-2025" },
    update: {},
    create: {
      title: "Chemistry Grade 12", code: "CHEM-2025", joinCode: "CHM25A",
      description: "Organic, inorganic, and physical chemistry for board and competitive exam preparation.",
      status: "ACTIVE", createdById: inst2.id, maxStudents: 30,
      startDate: new Date("2025-04-15"), endDate: new Date("2025-12-31"),
    },
  });

  const engCourse = await prisma.course.upsert({
    where: { code: "ENG-2025" },
    update: {},
    create: {
      title: "English Literature", code: "ENG-2025", joinCode: "ENG25D",
      description: "English literature and language skills for senior secondary students.",
      status: "DRAFT", createdById: inst2.id, maxStudents: 40,
    },
  });

  // --- Enrollments ---
  const enrollPairs = [
    ...students.slice(0, 5).map(s => ({ studentId: s.id, courseId: mathCourse.id })),
    ...students.slice(1, 6).map(s => ({ studentId: s.id, courseId: physicsCourse.id })),
    ...students.slice(3, 8).map(s => ({ studentId: s.id, courseId: chemCourse.id })),
  ];

  for (const pair of enrollPairs) {
    await prisma.enrollment.upsert({
      where: { studentId_courseId: pair },
      update: {},
      create: { ...pair, status: "ACTIVE" },
    });
  }

  console.log("✅ Users: 1 admin, 2 instructors, 8 students");
  console.log("✅ Courses: 4 (3 active, 1 draft)");
  console.log(`✅ Enrollments: ${enrollPairs.length}`);
  console.log("\n🎉 Seeding complete!\n");
  console.log("📋 Credentials:");
  console.log("   Admin:      admin@coachlms.com / Admin@123");
  console.log("   All others: <email> / Test@1234\n");
  console.log("🎟️  Join Codes:");
  console.log("   MTH25A — Mathematics Grade 12");
  console.log("   PHY25M — Physics Grade 12");
  console.log("   CHM25A — Chemistry Grade 12");
  console.log("   ENG25D — English Literature (Draft — can't join yet)");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
