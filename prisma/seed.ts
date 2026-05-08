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

  // --- Phase 2: Assignments ---
  const mathAssignment1 = await prisma.assignment.create({
    data: {
      courseId: mathCourse.id, title: "Chapter 5: Differential Calculus",
      description: "Solve problems 1-20 from Chapter 5. Show complete working.\n\nSubmit your solution as a Google Drive link to a PDF or photo of your work.",
      dueDate: new Date("2025-06-15"), totalMarks: 50,
    },
  });

  const mathAssignment2 = await prisma.assignment.create({
    data: {
      courseId: mathCourse.id, title: "Linear Algebra Practice Set",
      description: "Complete the attached practice set on matrices and determinants.",
      dueDate: new Date("2025-06-30"), totalMarks: 100,
    },
  });

  const physicsAssignment = await prisma.assignment.create({
    data: {
      courseId: physicsCourse.id, title: "Mechanics Problem Set 1",
      description: "Solve 10 problems on Newton's laws and friction. Upload your solutions.",
      dueDate: new Date("2025-06-20"), totalMarks: 40,
    },
  });

  // --- Sample Submissions + Grades ---
  const sub1 = await prisma.submission.create({
    data: { assignmentId: mathAssignment1.id, studentId: students[0].id, content: "https://drive.google.com/file/d/sample-aarav-ch5", status: "GRADED" },
  });
  await prisma.grade.create({
    data: { submissionId: sub1.id, marks: 42, feedback: "Good work! Minor error in Q15.", gradedById: inst1.id },
  });

  const sub2 = await prisma.submission.create({
    data: { assignmentId: mathAssignment1.id, studentId: students[1].id, content: "https://drive.google.com/file/d/sample-ananya-ch5", status: "SUBMITTED" },
  });

  await prisma.submission.create({
    data: { assignmentId: physicsAssignment.id, studentId: students[1].id, content: "Solved all 10 problems. Check attached link: https://drive.google.com/file/d/sample-physics", status: "SUBMITTED" },
  });

  // --- Materials ---
  await prisma.material.createMany({
    data: [
      { courseId: mathCourse.id, title: "NCERT Solutions Ch.5", url: "https://ncert.nic.in/textbook/math-12-ch5.pdf", type: "document", order: 0 },
      { courseId: mathCourse.id, title: "Calculus Video Lecture", url: "https://youtube.com/watch?v=sample-calculus", type: "video", order: 1 },
      { courseId: mathCourse.id, title: "Practice Problems Set", url: "https://drive.google.com/file/d/sample-practice-set", type: "link", order: 2 },
      { courseId: physicsCourse.id, title: "Mechanics Notes", url: "https://drive.google.com/file/d/mechanics-notes", type: "document", order: 0 },
      { courseId: physicsCourse.id, title: "Newton's Laws Simulation", url: "https://phet.colorado.edu/en/simulations/forces-and-motion", type: "link", order: 1 },
    ],
  });

  // --- Announcements ---
  await prisma.announcement.createMany({
    data: [
      { courseId: mathCourse.id, title: "Welcome to Mathematics Grade 12!", content: "Welcome to the course! Please review the syllabus and ensure you have your textbooks ready.\n\nFirst class will cover differential calculus fundamentals.", authorId: inst1.id },
      { courseId: mathCourse.id, title: "Assignment Deadline Extended", content: "The deadline for Chapter 5 assignment has been extended to June 15th.\n\nPlease complete all 20 problems.", authorId: inst1.id },
      { courseId: physicsCourse.id, title: "Lab Session Next Week", content: "We will have a practical lab session on Newton's Laws next week. Please bring your lab notebooks.", authorId: inst1.id },
    ],
  });

  // --- Attendance (sample for today) ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 5; i++) {
    await prisma.attendance.create({
      data: {
        courseId: mathCourse.id,
        studentId: students[i].id,
        date: today,
        status: i < 3 ? "PRESENT" : i === 3 ? "LATE" : "ABSENT",
        markedById: inst1.id,
      },
    });
  }

  console.log("✅ Users: 1 admin, 2 instructors, 8 students");
  console.log("✅ Courses: 4 (3 active, 1 draft)");
  console.log(`✅ Enrollments: ${enrollPairs.length}`);
  console.log("✅ Assignments: 3 (with sample submissions & grades)");
  console.log("✅ Materials: 5 links");
  console.log("✅ Announcements: 3");
  console.log("✅ Attendance: 5 records for today");
  console.log("\n🎉 Seeding complete!\n");
  console.log("📋 Credentials:");
  console.log("   Admin:      admin@coachlms.com / Admin@123");
  console.log("   All others: <email> / Test@1234\n");
  console.log("🎟️  Join Codes:");
  console.log("   MTH25A — Mathematics Grade 12");
  console.log("   PHY25M — Physics Grade 12");
  console.log("   CHM25A — Chemistry Grade 12");
  console.log("   ENG25D — English Literature (Draft)");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
