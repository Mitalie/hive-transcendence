import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      avatarData: true,
      avatarMime: true,
    },
  });

  if (!user?.avatarData || !user.avatarMime) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(user.avatarData, {
    headers: {
      "Content-Type": user.avatarMime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
