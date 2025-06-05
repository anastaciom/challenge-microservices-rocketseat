import { orders } from "./channels/orders.ts";

orders.consume(
  "orders",
  async (message) => {
    if (!message) {
      return null;
    }

    console.log({ message: message?.content.toString() });

    orders.ack(message); //Defino manualmente a mensagem que será retornada
  },
  {
    noAck: false,
    //noAck = false -> remove o retorno automatico da mensagem de sucesso
  }
);
