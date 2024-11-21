import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const User = sqliteTable("User", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  kennitala: text("kennitala").unique().notNull(),
  althydufelagid: integer("althydufelagid", { mode: "boolean" })
    .default(true)
    .notNull(),
  isAdmin: integer("isAdmin", { mode: "boolean" }).default(false).notNull(),
});

export const Password = sqliteTable("Password", {
  hash: text("hash").notNull(),
  userId: text("userId").notNull().unique(),
});

// Define relations
export const userRelations = relations(User, ({ one }) => ({
  password: one(Password, {
    fields: [User.id],
    references: [Password.userId],
  }),
}));

export const passwordRelations = relations(Password, ({ one }) => ({
  user: one(User, {
    fields: [Password.userId],
    references: [User.id],
  }),
}));

export type User = typeof User.$inferSelect;
export type Password = typeof Password.$inferSelect;

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  User,
  Password,
  userRelations,
  passwordRelations,
};
