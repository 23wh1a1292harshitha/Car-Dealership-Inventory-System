import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/prisma";
import bcrypt from "bcrypt";

describe("GET /api/vehicles", () => {
  let token: string;
  let vehicleId: number;

  const email = `user${Date.now()}@test.com`;
  const password = "User@123";

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: "Test User",
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    token = loginResponse.body.token;

    const vehicle = await prisma.vehicle.create({
      data: {
        make: "Honda",
        model: "Civic",
        category: "Sedan",
        price: 22000,
        quantity: 3,
      },
    });

    vehicleId = vehicle.id;
  });

  afterAll(async () => {
    await prisma.vehicle.delete({
      where: {
        id: vehicleId,
      },
    });

    await prisma.user.delete({
      where: {
        email,
      },
    });
  });

  it("should reject unauthenticated users", async () => {
    const response = await request(app)
      .get("/api/vehicles");

    expect(response.status).toBe(401);
  });

  it("should return all vehicles for an authenticated user", async () => {
    const response = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles).toBeDefined();
    expect(Array.isArray(response.body.vehicles)).toBe(true);
  });

  it("should return a vehicle by ID", async () => {
    const response = await request(app)
      .get(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicle.id).toBe(vehicleId);
    expect(response.body.vehicle.make).toBe("Honda");
    expect(response.body.vehicle.model).toBe("Civic");
  });
});