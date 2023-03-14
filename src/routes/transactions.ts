import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const documentos = await knex("documentos").select("*");

    return documentos;
  });

  app.get("/:id", async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);

    const documentos = await knex("documentos").where("id", id).first();

    return { documentos };
  });

  app.get("/summary", async () => {
    const summary = await knex("documentos")
      .sum("amount", { as: "amount" })
      .first();

    return summary;
  });

  app.post("/", async (request, response) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    await knex("documentos").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
    });

    return response.status(201).send();
  });
}
