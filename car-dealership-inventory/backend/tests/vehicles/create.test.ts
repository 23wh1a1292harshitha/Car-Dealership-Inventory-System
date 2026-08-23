import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/prisma";
import bcrypt from "bcrypt";

describe("POST /api/vehicles", () => {
  const email = `admin${Date.now()}@test.com`;
  const password = "Admin@123";

  let token: string;
  let vehicleId: number | undefined;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: "Test Admin",
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    token = response.body.token;
  });

  afterAll(async () => {
    if (vehicleId !== undefined) {
      await prisma.vehicle.deleteMany({
        where: {
          id: vehicleId,
        },
      });
    }

    await prisma.user.deleteMany({
      where: {
        email,
      },
    });
  });

  it("should reject unauthenticated users", async () => {
    const response = await request(app)
      .post("/api/vehicles")
      .send({
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 25000,
        quantity: 5,
      });

    expect(response.status).toBe(401);
  });

  it("should allow an admin to create a vehicle", async () => {
    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 25000,
        quantity: 5,
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Vehicle created successfully");
    expect(response.body.vehicle.make).toBe("Toyota");
    expect(response.body.vehicle.model).toBe("Camry");

    vehicleId = response.body.vehicle.id;
  });
});