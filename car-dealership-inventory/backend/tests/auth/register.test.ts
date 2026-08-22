import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app";

describe("POST /api/auth/register", () => {
  it("should register a new user successfully", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Harshitha",
        email: "harshitha@example.com",
        password: "Password123",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("User registered successfully");
  });
});