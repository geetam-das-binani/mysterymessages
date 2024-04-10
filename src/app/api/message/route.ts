import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const message = await prisma.messages.findFirst({
    where:{
        userId:"6616278d4518151f8a32d6a7"
    }
  });
  return NextResponse.json(message);
}
