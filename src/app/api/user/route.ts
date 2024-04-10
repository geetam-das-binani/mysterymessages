import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const user = await prisma.user.findUnique({
   where: {
       id:"6616278d4518151f8a32d6a7"
   },
   include:{
    messages:true
   }
    
  });
  return NextResponse.json(user);
}
