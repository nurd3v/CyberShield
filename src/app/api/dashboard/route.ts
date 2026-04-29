import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.application.findMany();

  const total = data.length;

  const totalSum = data.reduce(
    (acc, item) => acc + Number(item.subsidiesOwedSum),
    0
  );

  const rejected = data.filter(
    (i) => i.bidStatus === "Отклонена"
  ).length;

  const approved = total - rejected;

  return NextResponse.json({
    total,
    totalSum,
    rejected,
    approved,
  });
}