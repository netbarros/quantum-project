import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@quantum.com';
  const passwordPlain = 'admin123';
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);

  console.log(`Verificando/Criando usuário admin: ${email}`);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { 
      role: 'ADMIN', 
      isPremium: true,
      onboardingComplete: true,
      name: 'Quantum Architect'
    },
    create: {
      email,
      password: hashedPassword,
      name: 'Quantum Architect',
      role: 'ADMIN',
      isPremium: true,
      onboardingComplete: true
    }
  });

  console.log(`Sucesso! O usuário ${email} está pronto.`);
  console.log(`Credenciais de Acesso:`);
  console.log(`Email: ${email}`);
  console.log(`Senha: ${passwordPlain}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
