
import 'dotenv/config';

import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/generated/prisma/client.js';

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is missing. Check D:\\MediCore\\backend\\.env',
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
    }),
  });

  try {
    const email = 'rahul@example.com';
    const newPassword = 'Doctor@12345';

    console.log(`Looking up doctor account: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
    

    if (!user) {
      throw new Error(
        `No account exists for ${email}. No changes were made.`,
      );
    }

    if (user.role !== 'DOCTOR') {
      throw new Error(
        `Expected a DOCTOR account, but found role: ${user.role}. No changes were made.`,
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        isActive: true,
      },
    });

    console.log('\nDoctor password reset successfully.');
    console.log(`Email: ${user.email}`);
    console.log(`User ID: ${user.id}`);
    console.log('Account activated: Yes');
    console.log('Temporary password: Doctor@12345');
    console.log('\nYou can now test the doctor login endpoint.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('\nDoctor password reset failed:');

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});