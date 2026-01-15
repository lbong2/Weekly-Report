-- CreateTable
CREATE TABLE "chain_assignees" (
    "id" TEXT NOT NULL,
    "chain_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "chain_assignees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chain_assignees_chain_id_user_id_key" ON "chain_assignees"("chain_id", "user_id");

-- AddForeignKey
ALTER TABLE "chain_assignees" ADD CONSTRAINT "chain_assignees_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chain_assignees" ADD CONSTRAINT "chain_assignees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
