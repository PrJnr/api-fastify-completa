import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { checkSessionId } from "../middlewares/check-session-id";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: checkSessionId,
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const documentos = await knex("documentos")
        .select("*")
        .where("session_id", sessionId);

      return { documentos };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: checkSessionId,
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const sessionId = request.cookies.sessionId;
      const { id } = getTransactionParamsSchema.parse(request.params);

      const documentos = await knex("documentos")
        .where({ session_id: sessionId, id })
        .first();

      return { documentos };
    }
  );

  app.get(
    "/summary",
    {
      preHandler: checkSessionId,
    },
    async (request) => {
      const sessionId = request.cookies.sessionId;

      const summary = await knex("documentos")
        .where("session_id", sessionId)
        .sum("amount", { as: "amount" })
        .first();

      return summary;
    }
  );

  app.post("/", async (request, response) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();
      response.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias para expirar
      });
    }

    await knex("documentos").insert({
      id: randomUUID(),
      title,
      session_id: sessionId,
      amount: type === "credit" ? amount : amount * -1,
    });

    return response.status(201).send();
  });
}
