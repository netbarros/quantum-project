import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@quantum.com';

  console.log(`Buscando usuário: ${email}`);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`Usuário não encontrado: ${email}. Verifique o email ou se cadastre primeiro no app.`);
  } else {
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', isPremium: true },
    });
    console.log(`Sucesso: O usuário ${email} agora é ADMIN e PREMIUM no ecossistema Quantum.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
