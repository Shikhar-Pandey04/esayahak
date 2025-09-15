import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db/index';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Demo Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'demo@example.com' }
      },
      async authorize(credentials) {
        // For demo purposes, accept any email
        if (credentials?.email) {
          let user = await db.users.findByEmail(credentials.email);
          if (!user) {
            user = await db.users.create({
              email: credentials.email,
              name: credentials.email.split('@')[0],
            });
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
};
