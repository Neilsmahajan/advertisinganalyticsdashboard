import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ensure your prisma client is exported from this path
import { auth } from "@/auth";

// Now user id can be retrieved from session.user.id without TS error.
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const queries = await prisma.query.findMany({
      where: { userId, service: "Tracking Data" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ queries });
  } catch (error) {
    console.error("GET /api/tracking-data/queries error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { service, queryName, queryData } = await request.json();

    // Use connectOrCreate so that if the User record does not exist, it will be created.
    const newQuery = await prisma.query.create({
      data: {
        service,
        queryName,
        queryData,
        user: {
          connectOrCreate: {
            where: { id: userId },
            create: {
              id: userId,
              email: session.user.email || "", // minimal information; add more fields if needed
            },
          },
        },
      },
    });
    return NextResponse.json({ query: newQuery });
  } catch (error) {
    console.error("POST /api/tracking-data/queries error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, service, queryName, queryData } = await request.json();
    const updatedQuery = await prisma.query.update({
      where: { id },
      data: { service, queryName, queryData },
    });
    return NextResponse.json({ query: updatedQuery });
  } catch (error) {
    console.error("PUT /api/tracking-data/queries error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
