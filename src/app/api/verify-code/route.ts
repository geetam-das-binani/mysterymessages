import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  try {
    const { code, username } = await req.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await prisma.user.findFirst({
      where: {
        username: decodedUsername,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeExpired =
      new Date(user.verifyCodeExpiry!).getTime() > new Date().getTime();
    if (!isCodeValid || !isCodeExpired) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid code or code has  expired, please sign up again to get a new code",
        },
        { status: 400 }
      );
    }
    
    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        isVerified: true,
        verifyCode: null,
        verifyCodeExpiry: null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Account verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      { success: false, message: "Error verifying user" },
      { status: 500 }
    );
  }
}
