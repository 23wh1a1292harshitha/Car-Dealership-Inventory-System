import "dotenv/config";
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/prisma";

describe("POST /api/auth/register", () => {
  it("should register a new user successfully", async () => {
    const email = `harshitha-${Date.now()}@example.com`;

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Harshitha",
        email,
        password: "Password123",
      });

    expect(response.status).toBe(201);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    expect(user).not.toBeNull();
    expect(user?.name).toBe("Harshitha");
  });

  it("should reject registration when email already exists", async () => {
    const email = `duplicate-${Date.now()}@example.com`;

    // First registration
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Harshitha",
        email,
        password: "Password123",
      });

    // Second registration with same email
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Another User",
        email,
        password: "Password123",
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Email already registered");
  });
});