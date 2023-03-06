import fastify from "fastify";
import { knex } from "./database";

const app = fastify();

app.get("/", async () => {
  const documento = await knex("documentos").select("*");

  return documento;
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("OK");
  });
