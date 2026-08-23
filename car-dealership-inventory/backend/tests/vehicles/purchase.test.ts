import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/prisma";
import bcrypt from "bcrypt";

describe("POST /api/vehicles/:id/purchase", () => {
  let token: string;
  let vehicleId: number;

  const email = `purchase${Date.now()}@test.com`;
  const password = "Purchase@123";

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: "Purchase User",
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
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 25000,
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
        email,
      },
    });
  });

  it("should reject unauthenticated users", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`);

    expect(response.status).toBe(401);
  });

  it("should purchase a vehicle and decrease quantity", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Vehicle purchased successfully");
    expect(response.body.vehicle.quantity).toBe(4);
  });

  it("should reject purchase when quantity is zero", async () => {
    await prisma.vehicle.update({
      where: {
        id: vehicleId,
      },
      data: {
        quantity: 0,
      },
    });

    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Vehicle is out of stock");
  });
});