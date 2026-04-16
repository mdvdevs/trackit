import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string };
  }
}

function resolveAuthSecret(): string | undefined {
  const fromEnv =
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.BETTER_AUTH_SECRET?.trim();
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "development") {
    return "trackit-dev-only-do-not-use-in-production";
  }

  return undefined;
}

const googleClientId = process.env.AUTH_GOOGLE_ID?.trim();
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: resolveAuthSecret(),
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    Google(
      googleClientId && googleClientSecret
        ? { clientId: googleClientId, clientSecret: googleClientSecret }
        : {}
    ),
    Credentials({
      id: "guest",
      name: "Guest",
      credentials: {},
      async authorize() {
        const id = crypto.randomUUID();
        const email = `guest-${id}@guest.trackit.local`;
        await db.insert(users).values({
          id,
          name: "Guest",
          email,
        });
        return {
          id,
          name: "Guest",
          email,
          emailVerified: null,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        (token as { id?: string }).id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      const id =
        (token as { id?: string }).id ??
        (typeof token.sub === "string" ? token.sub : undefined);
      if (id) {
        session.user.id = id;
      }
      return session;
    },
  },
});
