import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import {  usernameValidation } from "@/schemas/signUpSchema";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParam = {
      username: searchParams.get("username"),
    };
    // ** <----------------- validate with zod------------->
    const result = UsernameQuerySchema.safeParse(queryParam);
  

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];

      return NextResponse.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(",")
              : "Invalid username",
          errors: usernameErrors,
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await prisma.user.findFirst({
      where: {
        username,
        isVerified: true,
      },
    });
    if (existingVerifiedUser) {
      return NextResponse.json(
        { success: false, message: "Username already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, message: "Username is unique" });
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { success: false, message: "Error checking username" },
      { status: 500 }
    );
  }
}
