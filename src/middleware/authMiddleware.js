import { createRemoteJWKSet, jwtVerify } from "jose";

let JWKS;

const getJWKS = () => {
  if (!JWKS) {
    const authUrl = process.env.BETTER_AUTH_URL;

    if (!authUrl) {
      throw new Error("BETTER_AUTH_URL is missing from server environment.");
    }

    JWKS = createRemoteJWKSet(
      new URL("/api/auth/jwks", authUrl)
    );
  }

  return JWKS;
};

const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    const authUrl = process.env.BETTER_AUTH_URL;

    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: authUrl,
      audience: authUrl,
    });

    if (!payload.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid token: user ID missing.",
      });
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      image: payload.image,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

export default authMiddleware;