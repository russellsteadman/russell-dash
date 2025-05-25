import { createRemoteJWKSet, jwtVerify } from "jose";
import type { LoaderFunctionArgs } from "react-router";

// verifyToken is a middleware to verify a CF authorization token
const verifyToken = async ({ request, context }: LoaderFunctionArgs) => {
  const token = request.headers.get("cf-access-jwt-assertion");

  // The Application Audience (AUD) tag for your application
  const AUD = context.cloudflare.env.POLICY_AUD;

  // Your CF Access team domain
  const TEAM_DOMAIN = context.cloudflare.env.TEAM_DOMAIN;
  const CERTS_URL = `${TEAM_DOMAIN}/cdn-cgi/access/certs`;

  const JWKS = createRemoteJWKSet(new URL(CERTS_URL));

  // Make sure that the incoming request has our token header
  if (!token) return false;

  try {
    await jwtVerify(token, JWKS, {
      issuer: TEAM_DOMAIN,
      audience: AUD,
      algorithms: ["RS256", "RS384", "RS512"],
    });
  } catch (error) {
    return false;
  }

  return true;
};

export default verifyToken;
