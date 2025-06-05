import "@opentelemetry/auto-instrumentations-node/register";
import { trace } from "@opentelemetry/api";
import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { z } from "zod";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { setTimeout } from "node:timers/promises";
import { db } from "../db/client.ts";
import { schema } from "../db/schema/index.ts";
import { randomUUID } from "node:crypto";
import { dispatchOrderCreated } from "../broker/messages/order_created.ts";
import { tracer } from "../tracer/index.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);
app.register(fastifyCors, { origin: "*" });

app.get("/health", () => {
  return "ok";
});

app.post(
  "/orders",
  {
    schema: {
      body: z.object({
        amount: z.number(),
      }),
    },
  },
  async (req, res) => {
    const { amount } = req.body;
    const orderId = randomUUID();

    try {
      await db.insert(schema.orders).values({
        amount,
        id: orderId,
        customerId: "bd965a32-5c3a-4e57-afc5-ee71185288a9", //TODO: REMOVER UUID CHUMBADO
      });

      const span = tracer.startSpan(
        "[TESTE] verificar a demora do 'setTimeout'"
      ); //inicio da verificação
      await setTimeout(2000);
      span.end(); //final da verificação

      trace.getActiveSpan()?.setAttribute("order_id", orderId);
      trace.getActiveSpan()?.setAttribute("qualquer_coisa", "test123");

      dispatchOrderCreated({
        orderId,
        amount,
        customer: { id: "bd965a32-5c3a-4e57-afc5-ee71185288a9" }, //TODO: REMOVER UUID CHUMBADO
      });

      return res.status(201).send();
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Error.");
    }
  }
);

app.listen({ host: "0.0.0.0", port: 3333 }).then(() => {
  console.log("[Orders] running...");
});
