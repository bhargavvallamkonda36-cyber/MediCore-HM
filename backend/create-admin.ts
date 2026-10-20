
import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/generated/prisma/client.js';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing in backend/.env');
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const email = 'admin@medicore.com';
    const password = 'Admin@12345';
    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        firstName: 'Admin',
        lastName: 'MediCore',
        role: 'ADMIN',
        isActive: true,
      },
      create: {
        email,
        passwordHash,
        firstName: 'Admin',
        lastName: 'MediCore',
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('Admin account created or updated successfully.');
    console.log('Email:', admin.email);
    console.log('Password:', password);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Failed to create admin account:', error);
  process.exitCode = 1;
});

