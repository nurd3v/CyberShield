import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.application.findMany();

  const totalSum = data.reduce(
    (acc, item) => acc + Number(item.subsidiesOwedSum),
    0
  );

  const approved = data.filter((i) => i.bidStatus === "Исполнена").length;
  const pending  = data.filter((i) =>
    ["Принята", "Сформировано поручение", "Отправлена"].includes(i.bidStatus)
  ).length;
  const rejected = data.filter((i) =>
    ["Отклонена", "Отозвано"].includes(i.bidStatus)
  ).length;

  // Топ-10 компаний по сумме субсидий
  const companyMap: Record<string, { amount: number; statuses: string[] }> = {};
  for (const item of data) {
    const name = item.enterprise;
    if (!companyMap[name]) companyMap[name] = { amount: 0, statuses: [] };
    companyMap[name].amount += Number(item.subsidiesOwedSum);
    companyMap[name].statuses.push(item.bidStatus);
  }

  const companies = Object.entries(companyMap)
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 10)
    .map(([name, val]) => {
      const total    = val.statuses.length;
      const rejected = val.statuses.filter((s) =>
        ["Отклонена", "Отозвано"].includes(s)
      ).length;
      const ratio = rejected / total;
      const risk = ratio > 0.5 ? "Высокий" : ratio > 0.2 ? "Средний" : "Низкий";
      return { name, amount: val.amount, risk };
    });

  return NextResponse.json({
    stats: {
      approved,
      pending,
      rejected,
      budget: totalSum,
    },
    companies,
  });
}
