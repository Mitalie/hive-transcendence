import "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      avatarVersion: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
  }
}
