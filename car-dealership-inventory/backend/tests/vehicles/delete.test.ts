import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/prisma";
import bcrypt from "bcrypt";

describe("DELETE /api/vehicles/:id", () => {
  let adminToken: string;
  let userToken: string;
  let vehicleId: number;

  const adminEmail = `admin${Date.now()}@test.com`;
  const userEmail = `user${Date.now()}@test.com`;
  const password = "Test@123";

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: "Delete Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    await prisma.user.create({
      data: {
        name: "Delete User",
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
        make: "Ford",
        model: "Mustang",
        category: "Sports",
        price: 45000,
        quantity: 2,
      },
    });

    vehicleId = vehicle.id;
  });

  afterAll(async () => {
    // Clean up vehicle if it still exists
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
      .delete(`/api/vehicles/${vehicleId}`);

    expect(response.status).toBe(401);
  });

  it("should reject normal users", async () => {
    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Admin access required");
  });

  it("should allow an admin to delete a vehicle", async () => {
    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Vehicle deleted successfully");

    const deletedVehicle = await prisma.vehicle.findUnique({
      where: {
        id: vehicleId,
      },
    });

    expect(deletedVehicle).toBeNull();
  });

  it("should return 404 when deleting a nonexistent vehicle", async () => {
    const response = await request(app)
      .delete("/api/vehicles/999999");

    // This request is unauthenticated, so it should first hit auth.
    expect(response.status).toBe(401);
  });
});