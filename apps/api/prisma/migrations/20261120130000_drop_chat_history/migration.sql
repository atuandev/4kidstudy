-- DropForeignKey
ALTER TABLE "public"."ChatHistory" DROP CONSTRAINT "ChatHistory_userId_fkey";

-- DropTable
DROP TABLE "public"."ChatHistory";
