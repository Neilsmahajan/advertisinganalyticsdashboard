import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Await the params promise before using its properties.
    const { id } = await context.params;
    const queryToDelete = await prisma.query.findUnique({
      where: { id },
    });
    if (!queryToDelete || queryToDelete.userId !== userId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await prisma.query.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/queries/[id] error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
