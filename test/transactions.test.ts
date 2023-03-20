import {
  afterAll,
  beforeAll,
  expect,
  test,
  describe,
  beforeEach,
} from "vitest";

import request from "supertest";

import { app } from "../src/app";
import { execSync } from "child_process";

describe("Transactions Routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("yarn run knex migrate:rollback --all");
    execSync("yarn run knex migrate:latest");
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

  test("Listar uma transação especifica", async () => {
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

    const transactionId = listTransactionsRes.body.documentos[0].id;

    const listTransactionsById = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(listTransactionsById.body.documentos).toEqual(
      expect.objectContaining({
        title: "New Test",
        amount: 5000,
      })
    );
  });

  test("Listar o resumo das transações", async () => {
    const createTransactionRes = await request(app.server)
      .post("/transactions")

      .send({
        title: "New Test",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionRes.get("Set-Cookie");

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "New Test",
        amount: 3500,
        type: "debit",
      });

    const summaryRes = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(summaryRes.body.summary).toEqual({ amount: 1500 });
  });
});
