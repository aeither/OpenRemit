import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

// Define the users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  address: text("address").notNull().unique(),
  lastActive: timestamp("last_active", { withTimezone: true }),
  totalCredits: text("total_credits").default("0"),
  xp: text("xp").default("0"),
});

// Define the schedulers table
export const schedulers = pgTable("schedulers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userAddress: text("user_address")
    .notNull()
    .references(() => users.address, { onDelete: "cascade" }),
  triggerRunningId: text("trigger_running_id"),
  currentDay: integer("current_day"),
  totalDays: integer("total_days"),
  content: text("content"),
  status: text("status").default("running").notNull(),
  breakdown: jsonb("breakdown").$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Define the contacts table
export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contactName: text("contact_name").notNull(),
  contactAddress: text("contact_address").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    userIdContactNameUnq: uniqueIndex("user_id_contact_name_unq").on(table.userId, table.contactName),
  };
});


// Export types for TypeScript inference
export type User = typeof users.$inferSelect;
export type Scheduler = typeof schedulers.$inferSelect;
export type Contact = typeof contacts.$inferSelect;

// Relations for users table
export const usersRelations = relations(users, ({ many }) => ({
  schedulers: many(schedulers),
  contacts: many(contacts),
}));

// Relations for schedulers table
export const schedulersRelations = relations(schedulers, ({ one }) => ({
  user: one(users, {
    fields: [schedulers.userAddress],
    references: [users.address],
  }),
}));

// Relations for contacts table
export const contactsRelations = relations(contacts, ({ one }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
  }),
}));
