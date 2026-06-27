import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (env.nodeEnv !== "production") {
      // Create or use a dummy dev user using findOrCreate to avoid race conditions
      const { User } = await import("../db/models.js");
      const [devUser] = await User.findOrCreate({
        where: { email: "dev@example.com" },
        defaults: { full_name: "Dev User" }
      });
      req.user = { id: devUser.get("id") as string, email: "dev@example.com" };
      return next();
    }
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { id: string; email: string };
    req.user = payload;
    next();
  } catch (error) {
    if (env.nodeEnv !== "production") {
      const { User } = await import("../db/models.js");
      const devUser = await User.findOne({ where: { email: "dev@example.com" } });
      if (devUser) {
        req.user = { id: devUser.get("id") as string, email: "dev@example.com" };
        return next();
      }
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}
