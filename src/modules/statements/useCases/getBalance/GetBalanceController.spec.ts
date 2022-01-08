import request from "supertest";
import { v4 as uuid } from "uuid";
import { Connection } from "typeorm";
import { hash } from "bcryptjs";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Get balance controller", () => {
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

  it("Should be able to get balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "usertest@email.com",
      password: "123456",
    });
    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "venda de produto supertest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    //console.log(" balance " + JSON.stringify(response.body, null, 2));
    expect(response.status).toBe(200);
    expect(response.body.statement.length).toBe(1);
    expect(response.body.balance).toEqual(500);
  });

  it("Should NOT be able to get balance if user does not exist", async () => {
    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer InvalidToken`,
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("JWT invalid token!");
  });
});
