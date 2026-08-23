import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/client";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@cardeal.com" },
    update: { role: "ADMIN" },
    create: {
      name: "Admin User",
      email: "admin@cardeal.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin: ${admin.email}  password: Admin@123`);

  // Regular user
  const userPassword = await bcrypt.hash("User@123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@cardeal.com" },
    update: {},
    create: {
      name: "Regular User",
      email: "user@cardeal.com",
      password: userPassword,
      role: "USER",
    },
  });
  console.log(`✅ User:  ${user.email}  password: User@123`);

  // Vehicles — skip if already have vehicles
  const existing = await prisma.vehicle.count();
  if (existing > 0) {
    console.log(`ℹ️  Vehicles already exist (${existing}), skipping vehicle seed.`);
  } else {
    await prisma.vehicle.createMany({
      data: [
        { make: "Toyota",   model: "Camry",    category: "Sedan",    price: 2500000, quantity: 5  },
        { make: "Toyota",   model: "RAV4",     category: "SUV",      price: 3200000, quantity: 3  },
        { make: "Honda",    model: "Civic",    category: "Sedan",    price: 2200000, quantity: 4  },
        { make: "Honda",    model: "CR-V",     category: "SUV",      price: 3500000, quantity: 2  },
        { make: "Ford",     model: "Explorer", category: "SUV",      price: 4500000, quantity: 2  },
        { make: "Ford",     model: "Mustang",  category: "Luxury",   price: 5500000, quantity: 1  },
        { make: "Hyundai",  model: "i20",      category: "Hatchback",price: 900000,  quantity: 8  },
        { make: "Maruti",   model: "Swift",    category: "Hatchback",price: 700000,  quantity: 10 },
        { make: "BMW",      model: "5 Series", category: "Luxury",   price: 7500000, quantity: 2  },
        { make: "Tata",     model: "Nexon",    category: "SUV",      price: 1400000, quantity: 6  },
        { make: "Mahindra", model: "Thar",     category: "SUV",      price: 1600000, quantity: 4  },
        { make: "Kia",      model: "Seltos",   category: "SUV",      price: 1900000, quantity: 5  },
      ],
    });
    console.log("✅ 12 vehicles seeded");
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
