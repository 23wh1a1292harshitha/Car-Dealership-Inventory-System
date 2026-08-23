import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/prisma";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

describe("PUT /api/vehicles/:id", () => {
  let adminToken: string;
  let userToken: string;
  let vehicleId: number | undefined;

  const testId = randomUUID();

  const adminEmail = `admin-${testId}@test.com`;
  const userEmail = `user-${testId}@test.com`;

  const password = "Test@123";

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: "Test Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    await prisma.user.create({
      data: {
        name: "Test User",
        email: userEmail,
        password: hashedPassword,
        role: "USER",
      },
    });

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password,
      });

    adminToken = adminLogin.body.token;

    const userLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: userEmail,
        password,
      });

    userToken = userLogin.body.token;

    const vehicle = await prisma.vehicle.create({
      data: {
        make: "Toyota",
        model: "Corolla",
        category: "Sedan",
        price: 20000,
        quantity: 5,
      },
    });

    vehicleId = vehicle.id;
  });

  afterAll(async () => {
    if (vehicleId !== undefined) {
      await prisma.vehicle.delete({
        where: {
          id: vehicleId,
        },
      });
    }

    await prisma.user.delete({
      where: {
        email: adminEmail,
      },
    });

    await prisma.user.delete({
      where: {
        email: userEmail,
      },
    });
  });

  it("should reject unauthenticated users", async () => {
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .send({
        make: "Toyota",
        model: "Corolla",
        category: "Sedan",
        price: 21000,
        quantity: 4,
      });

    expect(response.status).toBe(401);
  });

  it("should reject normal users", async () => {
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        make: "Toyota",
        model: "Corolla",
        category: "Sedan",
        price: 21000,
        quantity: 4,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Admin access required");
  });

  it("should allow an admin to update a vehicle", async () => {
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "Toyota",
        model: "Corolla",
        category: "Sedan",
        price: 21000,
        quantity: 4,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Vehicle updated successfully");
    expect(response.body.vehicle.price).toBe("21000");
    expect(response.body.vehicle.quantity).toBe(4);
  });
});