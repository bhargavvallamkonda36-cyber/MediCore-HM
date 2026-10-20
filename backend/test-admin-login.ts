
import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/generated/prisma/client.js';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing');
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const email = 'admin@medicore.com';
    const password = 'Admin@12345';

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('RESULT: Admin account not found');
      return;
    }

    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Active:', user.isActive);
    console.log(
      'Password hash exists:',
      Boolean(user.passwordHash),
    );
    console.log(
      'Password hash starts with:',
      user.passwordHash.substring(0, 7),
    );

    const matches = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    console.log('Password matches:', matches);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Test failed:', error);
  process.exitCode = 1;
});

