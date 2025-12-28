const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create or update system settings
  await prisma.systemSettings.upsert({
    where: { id: 'system' },
    update: {},
    create: {
      id: 'system',
      defaultFeePerReview: 5.00,
      payoutCycleType: 'weekly',
    },
  });
  console.log('System settings initialized');

  // Create default physician account (approved)
  const passwordHash = await bcrypt.hash('physician123', 12);
  
  const physician = await prisma.physician.upsert({
    where: { email: 'doctor@duodesire.com' },
    update: {
      status: 'approved',
      feePerReview: 5.00,
    },
    create: {
      name: 'Dr. Sarah Mitchell',
      email: 'doctor@duodesire.com',
      passwordHash: passwordHash,
      role: 'physician',
      status: 'approved',
      feePerReview: 5.00,
      licenseNumber: 'MD-12345',
    },
  });

  console.log('Created/updated physician:', physician.email);

  // Create admin account (approved)
  const adminHash = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.physician.upsert({
    where: { email: 'admin@duodesire.com' },
    update: {
      status: 'approved',
      feePerReview: 0, // Admins don't earn review fees
    },
    create: {
      name: 'Admin User',
      email: 'admin@duodesire.com',
      passwordHash: adminHash,
      role: 'admin',
      status: 'approved',
      feePerReview: 0,
    },
  });

  console.log('Created/updated admin:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
