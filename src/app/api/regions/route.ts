import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.application.findMany();

  const regionMap: Record<string, { amount: number; total: number; approved: number; rejected: number }> = {};

  for (const item of data) {
    const r = item.state;
    if (!regionMap[r]) regionMap[r] = { amount: 0, total: 0, approved: 0, rejected: 0 };
    regionMap[r].amount += Number(item.subsidiesOwedSum);
    regionMap[r].total += 1;
    if (item.bidStatus === "Исполнена") regionMap[r].approved += 1;
    if (["Отклонена", "Отозвано"].includes(item.bidStatus)) regionMap[r].rejected += 1;
  }

  const regions = Object.entries(regionMap)
    .sort((a, b) => b[1].amount - a[1].amount)
    .map(([name, val]) => ({
      name,
      amount: val.amount,
      total: val.total,
      approved: val.approved,
      rejected: val.rejected,
      approvalRate: Math.round((val.approved / val.total) * 100),
    }));

  return NextResponse.json({ regions });
}
