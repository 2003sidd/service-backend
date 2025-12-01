import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import logger from "../utility/wingstonLogger";
import { env } from "process";


// Middleware to check if the user has the required role(s)
const authorize = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).send({ message: "Authentication required" });
    }
    try {
      // Verify the token and extract the payload
      const decoded: any = jwt.verify(token, "Service@2026/12/09");

      // Check if the user has one of the required roles
      //   if (!roles.includes(decoded.role)) {
      //     return res.status(403).send({ message: "Access forbidden: Insufficient rights" });
      //   }

      // Attach user info to the request object (optional)
      req.user = decoded;
      next(); // Allow access to the route
    } catch (error) {
      logger.error("error at authorize user is ", error)
      return res.status(401).send({ message: "Invalid or expired token" });
    }
  };
};



export { authorize }