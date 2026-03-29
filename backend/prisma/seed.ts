import { PrismaClient } from '@prisma/client';
import { STATIC_SESSIONS } from '../src/utils/staticContent';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with initial users and system assets...');

  // Create a system user to "own" the global static fallback contents if needed
  // Alternatively, the SDD notes that `Content` has `userId` referencing `User`.
  // Here we just seed a mock admin / system host.
  const hashedPassword = await bcrypt.hash('quantum123', 12);
  
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@quantumproject.app' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'system@quantumproject.app',
      name: 'Quantum System',
      password: hashedPassword,
      role: 'ADMIN',
      language: 'pt-BR',
      profileType: 'STRUCTURED',
      level: 'INTEGRATED',
    },
  });

  console.log(`System user created: ${systemUser.email}`);

  // Example of seeding static fallback sessions into the database.
  // Note: in a real environment the fallback is served directly from staticContent.ts,
  // but this fulfills the requirement to "load static content into the database".
  for (let day = 1; day <= 7; day++) {
    const session = STATIC_SESSIONS[day];
    if (session) {
      // Upsert based on unique constraint [userId, day]
      await prisma.content.upsert({
        where: {
          userId_day: {
            userId: systemUser.id,
            day: day,
          },
        },
        update: {
          contentJSON: session as any,
          isStatic: true,
        },
        create: {
          userId: systemUser.id,
          day,
          contentJSON: session as any,
          isStatic: true,
        },
      });
      console.log(`Seeded static content for day ${day}`);
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
