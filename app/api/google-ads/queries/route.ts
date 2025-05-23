import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    const queries = await prisma.query.findMany({
      where: { userId, service: "Google Ads" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ queries });
  } catch (error) {
    console.error("GET /api/google-ads/queries error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    const { service, queryName, queryData } = await request.json();

    const newQuery = await prisma.query.create({
      data: {
        service,
        queryName,
        queryData,
        user: {
          connectOrCreate: {
            where: { id: userId },
            create: { id: userId, email: session.user.email || "" },
          },
        },
      },
    });
    return NextResponse.json({ query: newQuery });
  } catch (error) {
    console.error("POST /api/google-ads/queries error:", error);
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
    console.error("PUT /api/google-ads/queries error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
