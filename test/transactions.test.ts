import { afterAll, beforeAll, expect, test, describe } from "vitest";

import request from "supertest";

import { app } from "../src/app";

describe("Transactions Routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("Criar uma nova transação", async () => {
    const response = await request(app.server).post("/transactions").send({
      title: "New Test",
      amount: 5000,
      type: "credit",
    });

    expect(response.statusCode).equals(201);
  });

  test("Listar todas as transações", async () => {
    const createTransactionRes = await request(app.server)
      .post("/transactions")
      .send({
        title: "New Test",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionRes.get("Set-Cookie");

    const listTransactionsRes = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listTransactionsRes.body.documentos).toEqual([
      expect.objectContaining({
        title: "New Test",
        amount: 5000,
      }),
    ]);
  });
});
