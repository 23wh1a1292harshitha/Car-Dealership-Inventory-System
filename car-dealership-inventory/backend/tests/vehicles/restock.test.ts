import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/prisma";
import bcrypt from "bcrypt";

describe("POST /api/vehicles/:id/restock", () => {
  let adminToken: string;
  let userToken: string;
  let vehicleId: number;

  const adminEmail = `restockadmin${Date.now()}@test.com`;
  const userEmail = `restockuser${Date.now()}@test.com`;
  const password = "Test@123";

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: "Restock Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    await prisma.user.create({
      data: {
        name: "Restock User",
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
        make: "BMW",
        model: "X5",
        category: "SUV",
        price: 60000,
        quantity: 5,
      },
    });

    vehicleId = vehicle.id;
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany({
      where: {
        id: vehicleId,
      },
    });

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
      .post(`/api/vehicles/${vehicleId}/restock`)
      .send({
        quantity: 5,
      });

    expect(response.status).toBe(401);
  });

  it("should reject normal users", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        quantity: 5,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Admin access required");
  });

  it("should allow an admin to restock a vehicle", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        quantity: 5,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Vehicle restocked successfully");
    expect(response.body.vehicle.quantity).toBe(10);
  });
});