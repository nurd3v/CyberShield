-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "enterprise" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "bidStatus" TEXT NOT NULL,
    "subsidiesOwedSum" BIGINT NOT NULL,
    "sendDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);
