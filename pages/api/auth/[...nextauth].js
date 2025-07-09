 // pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import { authConfig } from "../../../lib/auth"; // Correct path to your authConfig

export default NextAuth(authConfig);

console.log("DEBUG: pages/api/auth/[...nextauth].js is being processed.");
