import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.application.findMany();

  // По месяцам
  const monthMap: Record<string, number> = {};
  for (const item of data) {
    const d = new Date(item.sendDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap[key] = (monthMap[key] || 0) + Number(item.subsidiesOwedSum);
  }
  const byMonth = Object.entries(monthMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, amount]) => ({ month, amount }));

  // По статусам
  const statusMap: Record<string, number> = {};
  for (const item of data) {
    statusMap[item.bidStatus] = (statusMap[item.bidStatus] || 0) + 1;
  }
  const byStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

  // Топ регионов по сумме
  const regionMap: Record<string, number> = {};
  for (const item of data) {
    regionMap[item.state] = (regionMap[item.state] || 0) + Number(item.subsidiesOwedSum);
  }
  const topRegions = Object.entries(regionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([region, amount]) => ({ region, amount }));

  return NextResponse.json({ byMonth, byStatus, topRegions });
}
