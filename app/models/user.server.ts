import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}
export async function getUserByKennitala(kennitala: User["kennitala"]) {
  return prisma.user.findUnique({ where: { kennitala } });
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

  return prisma.user.create({
    data: {
      name,
      email,
      kennitala,
      althydufelagid,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function updateUserPassword(user: User, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.password.update({
    data: { hash: hashedPassword },
    where: { userId: user.id },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
