
import "dotenv/config";
import * as bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client.js";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const email = (
    process.env.ADMIN_EMAIL || "admin@medicore.com"
  ).trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing.");
  }

  if (!password || password.length < 12) {
    throw new Error(
      "Set ADMIN_PASSWORD to a strong password of at least 12 characters.",
    );
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      if (existingAdmin.role !== "ADMIN") {
        throw new Error(
          `The account ${email} already exists and is not an ADMIN. No changes were made.`,
        );
      }

      console.log(
        `An ADMIN account already exists for ${email}. No changes were made.`,
      );
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: "Admin",
        lastName: "MediCore",
        role: "ADMIN",
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    console.log("Admin account created successfully.");
    console.log("Account details:", admin);
    console.log("The password was not printed.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    "Admin account operation failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
});
