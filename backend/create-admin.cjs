
const { PrismaClient } = require('./src/generated/prisma/client.js');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing from backend/.env');
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const email = 'admin@medicore.com';
    const password = 'Admin@12345';

    const passwordHash = await bcrypt.hash(password, 10);

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

    console.log('\nAdmin account created successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', password);
    console.log('Role:', admin.role);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Failed to create admin account:', error);
  process.exitCode = 1;
});

