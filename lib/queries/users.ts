import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { Password, User } from "../../schema";
import { db } from "../db";

export async function getUserById(id: User["id"]) {
  return db.query.User.findFirst({ where: eq(User.id, id) });
}

export async function getUserByEmail(email: User["email"]) {
  return db.query.User.findFirst({ where: eq(User.email, email) });
}
export async function getUserByKennitala(kennitala: User["kennitala"]) {
  return db.query.User.findFirst({ where: eq(User.kennitala, kennitala) });
}

export async function createUser({
  email,
  name,
  password,
  kennitala,
  althydufelagid,
}: {
  email: User["email"];
  name: string;
  password: string;
  kennitala: string;
  althydufelagid: boolean;
}) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await db
    .insert(User)
    .values({
      name,
      email,
      kennitala,
      althydufelagid,
    })
    .returning()
    .get();
  await db.insert(Password).values({
    userId: user.id,
    hash: hashedPassword,
  });
  return user;
}

export async function updateUserPassword(user: User, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await db
    .update(Password)
    .set({
      hash: hashedPassword,
    })
    .where(eq(Password.userId, user.id));
}
