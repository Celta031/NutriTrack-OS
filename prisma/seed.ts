import { ensureSeeded } from "../src/lib/seed-data";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding NutriTrack OS database with Default Balanced Meal Plan Template (Sample Seed)...");
  await ensureSeeded();
  const ingCount = await prisma.ingredient.count();
  const mealCount = await prisma.mealPlanTemplate.count();
  console.log(`Seed complete! Ingredients: ${ingCount}, Meal Templates: ${mealCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
