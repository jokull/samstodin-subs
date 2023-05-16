import {
  redirect,
  type LoaderArgs,
  type V2_MetaFunction,
} from "@remix-run/node";
import { getUserById } from "~/models/user.server";
import { requireUserId } from "~/session.server";

export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  if (user) {
    return redirect("/askriftir");
  } else {
    return redirect("/join");
  }
};

export default function Index() {
  return <div></div>;
}
