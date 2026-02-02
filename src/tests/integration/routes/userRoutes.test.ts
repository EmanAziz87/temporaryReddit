import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../../index";
import prisma from "../../../lib/prisma";
import { afterEach, beforeEach } from "node:test";

describe("User Routes", () => {
  beforeAll(async () => {
    await prisma.users.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /users/register", () => {
    it("should successfully register a new user and login", async () => {
      const response = await request(app).post("/users/register").send({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        birthdate: "1999-01-06",
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("SUCCESS");
      expect(response.body.message).toBe("Registered and Logged in");
    });

    describe("Duplicate username or email checks", () => {
      beforeEach(async () => {
        await request(app).post("/users/register").send({
          email: "test@example.com",
          username: "testuser",
          password: "password123",
          birthdate: "1999-01-06",
        });
      });

      afterEach(async () => {
        await prisma.users.deleteMany();
      });

      it("should respond with a 409 if username already exists", async () => {
        const secondRegistrationResponse = await request(app)
          .post("/users/register")
          .send({
            email: "test@example2.com",
            username: "testuser",
            password: "password12345",
            birthdate: "1997-05-08",
          });

        expect(secondRegistrationResponse.status).toBe(409);
        expect(secondRegistrationResponse.body.message).toBe(
          "Duplicate Already Exists",
        );
      });

      it("should respond with a 409 if email already exists", async () => {
        const secondRegistrationResponse = await request(app)
          .post("/users/register")
          .send({
            email: "test@example.com",
            username: "testuser2",
            password: "password12345",
            birthdate: "1997-05-08",
          });

        expect(secondRegistrationResponse.status).toBe(409);
        expect(secondRegistrationResponse.body.message).toBe(
          "Duplicate Already Exists",
        );
      });
    });

    it(
      "should respond with 400 invalid request error if registration input does not have the required properties",
    );

    it(
      "should respond with 400 invalid request error if registration input has too many properties",
    );
  });
});
