import { getToken } from "~/lib/signup";

console.log(
  await getToken({
    email: "jokull@solberg.is",
    kennitala: "1803862709",
    althydufelagid: true,
    name: "Jokull",
    planId: "123",
  }),
);
