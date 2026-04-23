import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import profileData from '../seed_profiles.json' with { type: 'json' };

const prisma = new PrismaClient();

const seedData = {
  profiles: [],
};

async function main() {
  await prisma.profile.deleteMany();
  console.log('Seeding...');

  const profiles = profileData.profiles.map((p) => ({
    name: p.name,
    gender: p.gender,
    gender_probability: p.gender_probability,
    age: p.age,
    age_group: p.age_group,
    country_id: p.country_id,
    country_name: p.country_name,
    country_probability: p.country_probability,
  }));

  const batchSize = 100;
  for (let i = 0; i < profiles.length; i += batchSize) {
    const batch = profiles.slice(i, i + batchSize);
    await prisma.profile.createMany({ data: batch });
    console.log(
      `Inserted batch ${Math.min(i + batchSize, profiles.length)}/${profiles.length}`,
    );
  }

  console.log('Seed data has been inserted.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding failed', e);
    await prisma.$disconnect();
    process.exit(1);
  });
