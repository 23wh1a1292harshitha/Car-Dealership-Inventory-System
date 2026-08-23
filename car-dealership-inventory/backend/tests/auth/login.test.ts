import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/prisma";

describe("POST /api/auth/login", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: "login@example.com",
      },
    });

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login User",
        email: "login@example.com",
        password: "Password123",
      });
  });

  it("should login successfully with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "Password123",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.user.email).toBe("login@example.com");
    expect(response.body.token).toBeDefined();
    expect(typeof response.body.token).toBe("string");
  });

  it("should reject invalid password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "WrongPassword",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});