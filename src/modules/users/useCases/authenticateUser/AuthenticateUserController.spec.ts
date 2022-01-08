import request from "supertest";
import { v4 as uuid } from "uuid";
import { Connection } from "typeorm";
import { hash } from "bcryptjs";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Authenticate User", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash("123456", 8);
    const id = uuid();
    const email = "usertest@email.com";

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'user', '${email}',  '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate an user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "usertest@email.com",
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.name).toEqual("user");
  });

  it("Should NOT be able to authenticate an user using an nonexistent email", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "wrongEmail@email.com",
      password: "123456",
    });
    expect(response.status).toBe(401);
  });

  it("Should NOT be able to authenticate an user using wrong password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "usertest@email.com",
      password: "wrongPassword",
    });

    expect(response.status).toBe(401);
  });
});
