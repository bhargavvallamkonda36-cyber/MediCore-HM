import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from './src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is missing from .env');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const email = 'bhargavchandra673@gmail.com';

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('Patient account not found.');
      return;
    }

    console.log('Email:', user.email);
    console.log('User ID:', user.id);
    console.log('Role:', user.role);
    console.log('Active:', user.isActive);

    const readline = await import('node:readline/promises');

    const terminal = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let password: string;

    try {
      password = await terminal.question(
        'Enter the password to verify: ',
      );
    } finally {
      terminal.close();
    }

    const matches = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    console.log('Password matches stored hash:', matches);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Check failed:', error);
  process.exitCode = 1;
});
