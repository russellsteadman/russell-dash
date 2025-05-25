import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/cover-letter", "routes/cover-letter.tsx"),
] satisfies RouteConfig;
