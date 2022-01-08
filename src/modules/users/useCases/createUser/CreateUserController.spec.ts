import request from "supertest";
import { v4 as uuid } from "uuid";
import { Connection } from "typeorm";
import { hash } from "bcryptjs";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create an user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "user supertest",
      email: "usertest@email.com",
      password: "123456",
    });

    expect(response.status).toBe(201);
  });

  it("Should NOT be able create a new user with an existing email", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "user2 supertest",
      email: "usertest@email.com",
      password: "123456",
    });

    expect(response.status).toBe(400);
  });
});
