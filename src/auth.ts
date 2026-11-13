import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
        if (!parsed.success) return null;

        await connectDB();
        const user = await User.findOne({
          email: parsed.data.email.toLowerCase(),
        }).select("+password");
        if (!user || !user.password || !user.isActive) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.password);
        if (!ok) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image ?? null,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    // Google diye prothom bar login korle customer account baniye dei
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        await connectDB();
        const email = user.email.toLowerCase();
        let dbUser = await User.findOne({ email });
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name ?? email,
            email,
            image: user.image ?? undefined,
            provider: "google",
            role: "customer",
          });
        }
        if (!dbUser.isActive) return false;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          await connectDB();
          const u = await User.findOne({ email: user.email!.toLowerCase() });
          token.id = u?._id.toString();
        } else {
          token.id = user.id;
        }
      }
      return token;
    },
    // Role protibar database theke ane, tai role bodlale sathe sathe kaj kore
    async session({ session, token }) {
      session.user.id = "";
      session.user.role = "customer";

      if (token.id) {
        await connectDB();
        const u = await User.findById(token.id).lean<{
          _id: Types.ObjectId;
          name: string;
          image?: string;
          role: string;
          isActive: boolean;
        }>();
        if (u && u.isActive) {
          session.user.id = u._id.toString();
          session.user.role = u.role as "customer" | "seller" | "admin";
          session.user.name = u.name;
          session.user.image = u.image ?? null;
        }
      }
      return session;
    },
  },
});