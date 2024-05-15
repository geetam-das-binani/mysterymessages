import { NextAuthOptions } from "next-auth";

import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",

      name: "Credentials",

      credentials: {
        identifier: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
       
        
        try {
          const user = await prisma.user.findFirst({
            where: {
              OR:[
               { email: credentials.identifier,},
               {username: credentials.identifier}
              ]
            },
          });

          if (!user) {
            throw new Error("User not found");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account first");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid username or password");
          } else {
            return user;
          }
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
  ],
  callbacks: {
    
    async jwt({ token, user }) {
      if (user) {
        token._id = user.id?.toString();
        token.isVerified = user?.isVerified;
        token.isAcceptingMessages = user?.isAcceptingMessages;
        token.username = user?.username;
      }
      
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token?._id;
        session.user.isVerified = token?.isVerified;
        session.user.isAcceptingMessages = token?.isAcceptingMessages;
        session.user.username = token?.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXT_AUTH_SECRET,
};

export default authOptions;
