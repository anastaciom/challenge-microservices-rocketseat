import { timestamp } from "drizzle-orm/pg-core";
import { pgTable, text } from "drizzle-orm/pg-core";

export const invoices = pgTable("invoices", {
  id: text().primaryKey(),
  orderId: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
