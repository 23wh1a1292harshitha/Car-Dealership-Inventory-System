import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/prisma";
import bcrypt from "bcrypt";

describe("GET /api/vehicles - filters and pagination", () => {
  let token: string;
  const email = `filter${Date.now()}@test.com`;
  const password = "Test@123";

  const vehicleIds: number[] = [];

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: "Filter User",
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

    const vehicles = await prisma.vehicle.createMany({
      data: [
        {
          make: "Toyota",
          model: "Camry",
          category: "Sedan",
          price: 25000,
          quantity: 5,
        },
        {
          make: "Toyota",
          model: "RAV4",
          category: "SUV",
          price: 32000,
          quantity: 3,
        },
        {
          make: "Honda",
          model: "Civic",
          category: "Sedan",
          price: 22000,
          quantity: 4,
        },
        {
          make: "Ford",
          model: "Explorer",
          category: "SUV",
          price: 45000,
          quantity: 2,
        },
      ],
    });

    const createdVehicles = await prisma.vehicle.findMany({
      where: {
        make: {
          in: ["Toyota", "Honda", "Ford"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    createdVehicles.forEach((vehicle) => {
      vehicleIds.push(vehicle.id);
    });
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany({
      where: {
        id: {
          in: vehicleIds,
        },
      },
    });

    await prisma.user.delete({
      where: {
        email,
      },
    });
  });

  it("should filter vehicles by make", async () => {
    const response = await request(app)
      .get("/api/vehicles?make=Toyota")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles.length).toBeGreaterThan(0);

    response.body.vehicles.forEach((vehicle: any) => {
      expect(vehicle.make).toBe("Toyota");
    });
  });

  it("should filter vehicles by model", async () => {
    const response = await request(app)
      .get("/api/vehicles?model=Camry")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles.length).toBeGreaterThan(0);
    expect(response.body.vehicles[0].model).toBe("Camry");
  });

  it("should filter vehicles by category", async () => {
    const response = await request(app)
      .get("/api/vehicles?category=SUV")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    response.body.vehicles.forEach((vehicle: any) => {
      expect(vehicle.category).toBe("SUV");
    });
  });

  it("should filter vehicles by minimum price", async () => {
    const response = await request(app)
      .get("/api/vehicles?minPrice=30000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    response.body.vehicles.forEach((vehicle: any) => {
      expect(Number(vehicle.price)).toBeGreaterThanOrEqual(30000);
    });
  });

  it("should filter vehicles by maximum price", async () => {
    const response = await request(app)
      .get("/api/vehicles?maxPrice=30000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    response.body.vehicles.forEach((vehicle: any) => {
      expect(Number(vehicle.price)).toBeLessThanOrEqual(30000);
    });
  });

  it("should support multiple filters", async () => {
    const response = await request(app)
      .get("/api/vehicles?make=Toyota&category=SUV")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    response.body.vehicles.forEach((vehicle: any) => {
      expect(vehicle.make).toBe("Toyota");
      expect(vehicle.category).toBe("SUV");
    });
  });

  it("should support pagination", async () => {
    const response = await request(app)
      .get("/api/vehicles?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles).toBeDefined();
    expect(response.body.vehicles.length).toBeLessThanOrEqual(2);

    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination.currentPage).toBe(1);
    expect(response.body.pagination.pageLimit).toBe(2);
  });

  it("should reject invalid page", async () => {
    const response = await request(app)
      .get("/api/vehicles?page=0")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it("should reject invalid limit", async () => {
    const response = await request(app)
      .get("/api/vehicles?limit=0")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it("should reject invalid minimum price", async () => {
    const response = await request(app)
      .get("/api/vehicles?minPrice=-100")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});