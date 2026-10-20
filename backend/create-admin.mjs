import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/generated/prisma/client.ts';

const adapter = new PrismaPg({
connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
const email = 'admin@medicore.com';
const password = 'Admin@12345';

const passwordHash = await bcrypt.hash(password, 10);

const admin = await prisma.user.upsert({
where: { email },
update: {
passwordHash,
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

console.log('\nAdmin account is ready!');
console.log('Email:', admin.email);
console.log('Password:', password);
}

main()
.catch((error) => {
console.error('Failed to create admin:', error);
process.exitCode = 1;
})
.finally(async () => {
await prisma.$disconnect();
});
