import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.application.findMany();

  const companyMap: Record<string, { amount: number; statuses: string[]; regions: Set<string> }> = {};

  for (const item of data) {
    const name = item.enterprise;
    if (!companyMap[name]) companyMap[name] = { amount: 0, statuses: [], regions: new Set() };
    companyMap[name].amount += Number(item.subsidiesOwedSum);
    companyMap[name].statuses.push(item.bidStatus);
    companyMap[name].regions.add(item.state);
  }

  const companies = Object.entries(companyMap)
    .sort((a, b) => b[1].amount - a[1].amount)
    .map(([name, val]) => {
      const total = val.statuses.length;
      const approved = val.statuses.filter((s) => s === "Исполнена").length;
      const rejected = val.statuses.filter((s) => ["Отклонена", "Отозвано"].includes(s)).length;
      const pending = total - approved - rejected;
      const ratio = rejected / total;
      const risk = ratio > 0.5 ? "Высокий" : ratio > 0.2 ? "Средний" : "Низкий";
      return {
        name,
        amount: val.amount,
        total,
        approved,
        rejected,
        pending,
        risk,
        region: [...val.regions][0],
      };
    });

  return NextResponse.json({ companies });
}
