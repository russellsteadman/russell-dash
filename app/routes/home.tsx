import verifyToken from "~/shared/auth";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dash | Russell" }, { name: "robots", content: "noindex" }];
}

export async function loader(args: Route.LoaderArgs) {
  const auth = await verifyToken(args);

  if (!auth) {
    return new Response("Unauthorized", { status: 401 });
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <div>Test</div>;
}
