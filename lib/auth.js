 // lib/auth.js

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createGuest, getGuest } from "./data-service";
import { supabase } from "./supabase";

// Environment variable checks for NextAuth configuration
if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
  console.error("CRITICAL ERROR: Missing AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET in environment variables.");
  throw new Error("Missing AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET. Check your .env.local file.");
}
if (!process.env.AUTH_SECRET) {
  console.error("CRITICAL ERROR: Missing AUTH_SECRET in environment variables.");
  throw new Error("Missing AUTH_SECRET. Check your .env.local file.");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_KEY) {
  console.error("CRITICAL ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_KEY.");
  throw new Error("Missing Supabase URL or Key. Check your .env.local file.");
}

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("DEBUG auth.js: authorize callback started.");
        if (!credentials?.email || !credentials?.password) {
          console.error("DEBUG auth.js: Email or password missing in credentials.");
          throw new Error("Please enter both email and password.");
        }

        try {
          console.log(`DEBUG auth.js: Attempting Supabase signInWithPassword for email: ${credentials.email}`);
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error("Supabase signInWithPassword error:", error); // Log full error object
            if (error.message.includes("Invalid login credentials")) {
                throw new Error("Invalid email or password.");
            }
            throw new Error(error.message || "Authentication failed.");
          }

          if (!data.user) {
            console.error("DEBUG auth.js: Supabase signInWithPassword returned no user data.");
            throw new Error("No user found with these credentials.");
          }

          console.log("DEBUG auth.js: Supabase user authenticated:", data.user.id, data.user.email);

          // Check if guest exists in your 'guests' table, create if not
          let guest = await getGuest(data.user.email);
          if (!guest) {
            console.log("DEBUG auth.js: Guest not found in 'guests' table, attempting to create.");
            const fallbackFullName = data.user.email.split('@')[0];
            guest = await createGuest({ email: data.user.email, fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || fallbackFullName });
            console.log("DEBUG auth.js: Guest created in 'guests' table:", guest);
          } else {
            console.log("DEBUG auth.js: Guest found in 'guests' table:", guest);
          }

          // Return a user object that NextAuth will use to create the session.
          return {
            id: data.user.id,
            email: data.user.email,
            name: guest?.fullName || data.user.user_metadata?.full_name || data.user.user_metadata?.name || fallbackFullName,
            image: data.user.user_metadata?.avatar_url || "/default-user.jpg",
            guestId: guest?.id,
          };

        } catch (authError) {
          console.error("Authorization error in authorize callback:", authError); // Log full error object
          throw new Error(authError.message || "An error occurred during authorization.");
        }
      },
    }),
  ],
  callbacks: {
    authorized({ req, token }) {
      console.log("DEBUG auth.js: authorized callback. Token present:", !!token);
      return !!token;
    },
    async signIn({ user, account, profile }) {
      console.log("DEBUG auth.js: signIn callback started. User:", user?.email, "Provider:", account?.provider);
      try {
        if (account.provider === "credentials") {
          if (!user.guestId) {
            console.log("DEBUG auth.js: signIn callback (credentials) - guestId missing from user, fetching.");
            const guest = await getGuest(user.email);
            user.guestId = guest?.id;
          }
          return true;
        }

        console.log("DEBUG auth.js: signIn callback (OAuth) - checking for existing guest.");
        const existingGuest = await getGuest(user.email);
        if (!existingGuest) {
          console.log("DEBUG auth.js: signIn callback (OAuth) - Guest not found, creating.");
          await createGuest({ email: user.email, fullName: user.name });
        }
        console.log("DEBUG auth.js: signIn callback completed successfully.");
        return true;
      } catch (error) {
        console.error("Error during signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }) {
      console.log("DEBUG auth.js: session callback started. Token:", token?.guestId);
      if (token && token.guestId) {
        session.user.guestId = token.guestId;
      } else if (session.user.email) {
        console.log("DEBUG auth.js: session callback - guestId missing from token, fetching from DB.");
        const guest = await getGuest(session.user.email);
        session.user.guestId = guest?.id;
      }
      console.log("DEBUG auth.js: session callback completed. Session user guestId:", session.user.guestId);
      return session;
    },
    async jwt({ token, user, account, profile }) {
      console.log("DEBUG auth.js: jwt callback started. User:", user?.email);
      if (user) {
        if (user.guestId) {
          token.guestId = user.guestId;
        } else if (user.email) {
          console.log("DEBUG auth.js: jwt callback - guestId missing from user, fetching from DB.");
          const guest = await getGuest(user.email);
          token.guestId = guest?.id;
        }
      }
      console.log("DEBUG auth.js: jwt callback completed. Token guestId:", token?.guestId);
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
};
