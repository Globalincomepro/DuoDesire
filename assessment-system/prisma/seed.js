const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create default physician account
  const passwordHash = await bcrypt.hash('physician123', 12);
  
  const physician = await prisma.physician.upsert({
    where: { email: 'doctor@duodesire.com' },
    update: {},
    create: {
      name: 'Dr. Sarah Mitchell',
      email: 'doctor@duodesire.com',
      passwordHash: passwordHash,
      role: 'physician',
    },
  });

  console.log('Created physician:', physician.email);

  // Create admin account
  const adminHash = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.physician.upsert({
    where: { email: 'admin@duodesire.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@duodesire.com',
      passwordHash: adminHash,
      role: 'admin',
    },
  });

  console.log('Created admin:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


