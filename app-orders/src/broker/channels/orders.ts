import { blokerClient } from "../client.ts";

export const orders = await blokerClient.createChannel();

await orders.assertQueue("orders");
