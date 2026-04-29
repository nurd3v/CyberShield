import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const all = await prisma.application.findMany({
    orderBy: { sendDate: "desc" },
  });

  let filtered = all;
  if (status) filtered = filtered.filter((i) => i.bidStatus === status);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((i) => i.enterprise.toLowerCase().includes(q));
  }

  const total = filtered.length;
  const items = filtered.slice((page - 1) * limit, page * limit).map((i) => ({
    id: i.id,
    enterprise: i.enterprise,
    state: i.state,
    bidStatus: i.bidStatus,
    subsidiesOwedSum: Number(i.subsidiesOwedSum),
    sendDate: i.sendDate,
  }));

  return NextResponse.json({ items, total, page, limit });
}
