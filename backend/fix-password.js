const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'system@quantumproject.app';
  const password = 'quantum123';
  const hashedPassword = await bcrypt.hash(password, 12);
  
  console.log(`Setting password for ${email} to ${password}`);
  console.log(`Hashed password: ${hashedPassword}`);

  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  const isMatch = await bcrypt.compare(password, user.password);
  console.log(`Verification match: ${isMatch}`);
  
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
