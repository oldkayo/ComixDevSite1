const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  try {
    const mainSocials = await prisma.socialLink.findMany();
    console.log("=== MAIN SITE SOCIAL LINKS ===");
    console.log(mainSocials);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
