import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: "facebook",
      },
    });
    return NextResponse.json({ message: "Disconnected successfully" });
  } catch (error) {
    console.error("Error disconnecting facebook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
