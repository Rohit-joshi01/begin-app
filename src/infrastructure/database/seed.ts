import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./connection.ts";
import Auth from "../../modules/auth/models/auth.model.ts";
import Profile from "../../modules/profiles/models/profile.model.ts";
import Startup from "../../modules/startups/models/startup.model.ts";
import Post from "../../modules/posts/models/post.model.ts";

/**
 * Database seeding script for development and demonstration.
 * Creates verified sample builders, startup pages, and milestone posts.
 */

export async function seedDatabase(): Promise<void> {
  try {
    await connectDB();
    console.log("Seeding database with initial dummy data...");

    const sampleEmails = [
      "arjun.sharma@college.edu",
      "sneha.patel@college.edu",
      "rohit.verma@college.edu",
    ];

    const existingUsers = await Auth.find({ email: { $in: sampleEmails } });
    const userIds = existingUsers.map((u: any) => u._id);

    await Startup.deleteMany({ ownerId: { $in: userIds } });
    await Profile.deleteMany({ userId: { $in: userIds } });
    await Post.deleteMany({ StartupName: { $in: ["CampusCart", "PulseAI"] } });
    await Auth.deleteMany({ email: { $in: sampleEmails } });

    // 1. Create Auth accounts
    const arjunAuth: any = await Auth.create({
      email: "arjun.sharma@college.edu",
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      role: "USER",
    });

    const snehaAuth: any = await Auth.create({
      email: "sneha.patel@college.edu",
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      role: "USER",
    });

    const rohitAuth: any = await Auth.create({
      email: "rohit.verma@college.edu",
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      role: "USER",
    });

    // 2. Create Builder Profiles
    await Profile.create({
      userId: arjunAuth._id,
      fullName: "Arjun Sharma",
      college: "Institute of Engineering & Tech",
      year: "3rd Year",
      branch: "Computer Science",
      bio: "Full-stack developer building scalable web and mobile apps. Passionate about campus commerce.",
      role: "FOUNDER",
      skills: ["React", "Node.js", "MongoDB", "Express", "Tailwind CSS"],
      interests: ["FinTech", "E-Commerce", "SaaS"],
      lookingFor: ["UI/UX Designer", "Growth Marketer"],
      availabilityStatus: "Looking for co-founder",
      weeklyHoursAvailable: 25,
      isBuilder: true,
      isOnboarded: true,
      pastWork: [
        {
          title: "Hostel Food Delivery App",
          url: "https://github.com/example/hostel-food",
          linkType: "GitHub",
          description: "Night delivery app used by 400+ hostel residents.",
        },
      ],
      socialLinks: {
        github: "https://github.com/example-arjun",
        linkedin: "https://linkedin.com/in/example-arjun",
      },
    });

    await Profile.create({
      userId: snehaAuth._id,
      fullName: "Sneha Patel",
      college: "Institute of Engineering & Tech",
      year: "4th Year",
      branch: "Information Technology",
      bio: "Product designer and frontend builder crafting delightful user interfaces and prototypes.",
      role: "JOINER",
      skills: ["UI/UX Design", "Figma", "React", "Design Systems"],
      interests: ["EdTech", "Social Networks", "Consumer Tech"],
      lookingFor: ["Early Stage Startup", "Hackathon Team"],
      availabilityStatus: "Open to join",
      weeklyHoursAvailable: 15,
      isBuilder: true,
      isOnboarded: true,
      pastWork: [
        {
          title: "College Club Portal Redesign",
          url: "https://www.figma.com/@example-sneha",
          linkType: "Figma",
          description: "Complete design system and wireframes for campus club management.",
        },
      ],
      socialLinks: {
        portfolio: "https://sneha-portfolio.example.com",
        linkedin: "https://linkedin.com/in/example-sneha",
      },
    });

    await Profile.create({
      userId: rohitAuth._id,
      fullName: "Rohit Verma",
      college: "Institute of Engineering & Tech",
      year: "2nd Year",
      branch: "Electronics & Communication",
      bio: "AI/ML enthusiast working on computer vision and edge computing models.",
      role: "BOTH",
      skills: ["Python", "PyTorch", "FastAPI", "OpenCV"],
      interests: ["Artificial Intelligence", "Robotics", "HealthTech"],
      lookingFor: ["Backend Developer", "Product Manager"],
      availabilityStatus: "Open to join",
      weeklyHoursAvailable: 20,
      isBuilder: true,
      isOnboarded: true,
      pastWork: [
        {
          title: "Campus Attendance Face Recognition",
          url: "https://github.com/example/face-attend",
          linkType: "GitHub",
          description: "Model achieved 96% accuracy across 500 test images.",
        },
      ],
    });

    // 3. Create Startups
    const campusCart: any = await Startup.create({
      name: "CampusCart",
      pitch: "Hyper-local marketplace connecting student buyers and sellers inside campus hostels.",
      problem: "Students frequently sell used books, appliances, and cycles via fragmented WhatsApp groups with high spam.",
      solution: "A verified campus marketplace with in-hostel delivery spots and student ID trust scoring.",
      industryTags: ["E-Commerce", "Marketplace", "Campus"],
      stage: "Building MVP",
      visibility: "PUBLIC",
      ownerId: arjunAuth._id,
      teamMembers: [
        {
          userId: arjunAuth._id,
          role: "Founder & Lead Dev",
          joinedDate: new Date(),
        },
        {
          userId: snehaAuth._id,
          role: "UI/UX Designer",
          joinedDate: new Date(),
        },
      ],
      openRoles: [
        {
          title: "Growth & Community Lead",
          skillsNeeded: ["Marketing", "Community Management", "Content Creation"],
          commitmentHours: 10,
          roleType: "co-founder",
          equityOrCreditNote: "5% equity or project credit",
          status: "OPEN",
        },
      ],
      milestones: [
        {
          title: "Completed User Interviews",
          milestoneType: "Idea validated",
          description: "Interviewed 45 students across 3 hostels to validate item turnover rates.",
          completedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Shipped Alpha Prototype",
          milestoneType: "Prototype ready",
          description: "Internal testing with 20 close peers completed.",
          completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ],
      links: {
        website: "https://campuscart.example.com",
        github: "https://github.com/example/campuscart",
      },
    });

    const pulseAI: any = await Startup.create({
      name: "PulseAI",
      pitch: "Stealth automated diagnostic logging for embedded devices.",
      problem: "Proprietary algorithm details hidden during stealth development.",
      solution: "Proprietary algorithm details hidden during stealth development.",
      industryTags: ["Artificial Intelligence", "DevTools"],
      stage: "Idea",
      visibility: "STEALTH",
      ownerId: rohitAuth._id,
      teamMembers: [
        {
          userId: rohitAuth._id,
          role: "Founder & AI Researcher",
          joinedDate: new Date(),
        },
      ],
      openRoles: [
        {
          title: "Embedded Systems Engineer",
          skillsNeeded: ["C++", "Rust", "Linux Kernel"],
          commitmentHours: 15,
          roleType: "co-founder",
          equityOrCreditNote: "Co-founder equity",
          status: "OPEN",
        },
      ],
      milestones: [
        {
          title: "Patent Prior Art Search",
          milestoneType: "Idea validated",
          description: "Completed prior art review with university incubator team.",
          completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    // 4. Link startups to profiles
    await Profile.updateOne(
      { userId: arjunAuth._id },
      {
        $push: {
          linkedStartups: {
            name: campusCart.name,
            stage: campusCart.stage,
            role: "Founder & Lead Dev",
            startupId: campusCart._id,
          },
        },
        $set: {
          "founderDetails.startupName": campusCart.name,
          "founderDetails.stage": campusCart.stage,
        },
      }
    );

    await Profile.updateOne(
      { userId: snehaAuth._id },
      {
        $push: {
          linkedStartups: {
            name: campusCart.name,
            stage: campusCart.stage,
            role: "UI/UX Designer",
            startupId: campusCart._id,
          },
        },
      }
    );

    await Profile.updateOne(
      { userId: rohitAuth._id },
      {
        $push: {
          linkedStartups: {
            name: pulseAI.name,
            stage: pulseAI.stage,
            role: "Founder & AI Researcher",
            startupId: pulseAI._id,
          },
        },
        $set: {
          "founderDetails.startupName": pulseAI.name,
          "founderDetails.stage": pulseAI.stage,
        },
      }
    );

    // 5. Seed Milestone Posts
    await Post.create([
      {
        title: "CampusCart Shipped Alpha Prototype to 20 Users",
        postType: "Milestone",
        body: "Super excited to share that CampusCart v0.1 has been tested with 20 hostel residents. Handled 35 test transactions with 0 downtime. Open roles for Growth Lead available now!",
        profileImageUrl: "/images/default.svg",
        StartupName: "CampusCart",
        time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        likesCount: 12,
        commentsCount: 3,
      },
      {
        title: "PulseAI Looking for Co-founder with Embedded Systems Experience",
        postType: "Looking For",
        body: "Building stealth AI tooling for hardware telemetry. Looking for an enthusiastic co-founder comfortable with low-level systems programming and microcontroller testbeds.",
        profileImageUrl: "/images/default.svg",
        StartupName: "PulseAI",
        time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        likesCount: 8,
        commentsCount: 1,
      },
    ]);

    console.log("Database seeded successfully!");
    console.log("Sample accounts created:");
    console.log("  - arjun.sharma@college.edu (Founder - CampusCart)");
    console.log("  - sneha.patel@college.edu (Joiner - Designer)");
    console.log("  - rohit.verma@college.edu (Both - PulseAI stealth)");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (
  process.argv[1] &&
  (process.argv[1].endsWith("src/infrastructure/database/seed.js") ||
    process.argv[1].endsWith("src/infrastructure/database/seed.ts"))
) {
  seedDatabase().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}

export default seedDatabase;
