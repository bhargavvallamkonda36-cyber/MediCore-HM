import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/generated/prisma/client.js';
import * as bcrypt from 'bcryptjs';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

async function main(): Promise<void> {
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
throw new Error(
'DATABASE_URL is not defined. Check backend/.env',
);
}

const adapter = new PrismaPg({
connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

try {
await prisma.$connect();


console.log('PostgreSQL connected successfully.');

const email = 'bhargavchandra673@gmail.com';

const user = await prisma.user.findUnique({
  where: { email },
});

if (!user) {
  throw new Error(`User not found: ${email}`);
}

if (user.role !== 'PATIENT') {
  throw new Error(
    `Expected a PATIENT account, but found ${user.role}.`,
  );
}

if (!user.isActive) {
  throw new Error(
    'The patient account is inactive. No changes made.',
  );
}

const terminal = readline.createInterface({
  input,
  output,
});

try {
  const password = await terminal.question(
    'Enter a NEW password (minimum 8 characters): ',
  );

  if (password.length < 8) {
    throw new Error(
      'Password must contain at least 8 characters.',
    );
  }

  const confirmation = await terminal.question(
    'Confirm the new password: ',
  );

  if (password !== confirmation) {
    throw new Error(
      'Passwords do not match. No changes made.',
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  console.log('\nPatient password reset successfully.');
  console.log(`Email: ${user.email}`);
  console.log(`User ID: ${user.id}`);
  console.log(`Role: ${user.role}`);
} finally {
  terminal.close();
}


} finally {
await prisma.$disconnect();
}
}

main().catch((error: unknown) => {
console.error('Password reset failed:', error);
process.exitCode = 1;
});
