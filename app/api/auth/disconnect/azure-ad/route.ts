import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: "azure-ad",
      },
    });
    return NextResponse.json({ message: "Disconnected successfully" });
  } catch (error) {
    console.error("Error disconnecting azure-ad:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
