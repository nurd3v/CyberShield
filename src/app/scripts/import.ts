import { prisma } from "../lib/prisma";
import data from "../data/data.json";

async function main() {
  for (const item of data) {
    await prisma.application.create({
      data: {
        enterprise: item.Enterprise,
        state: item.State,
        bidStatus: item.BidStatus,
        subsidiesOwedSum: BigInt(item.SubsidiesOwedSum),
        sendDate: new Date(item.SendDate),
      },
    });
  }

  console.log("Импорт завершён");
}

main();