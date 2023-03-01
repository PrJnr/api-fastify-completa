import fastify from "fastify";

const app = fastify();

app.get("/", async () => {});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("OK");
  });
