import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendVerificationEmails } from "@/helpers/sendVerificationEmails";
const prisma = new PrismaClient();
export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { email, username, password } = await req.json();
   
    
    const existingUserVerifiedByUsername = await prisma.user.findFirst({
      where: {
        username,
        isVerified: true,
      },
    });
   
    
    if (existingUserVerifiedByUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already exists",
        },
        { status: 400 }
      );
    }
    const existingUserByEmail = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "Username already exists with this email",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        const newUser = await prisma.user.update({
          where: {
            id: existingUserByEmail.id,
          },
          data: {
            username,
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry: expiryDate,
          },
        });
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          verifyCode,
          verifyCodeExpiry: expiryDate,
        },
      });
      
      
    }

    //** SEND VERIFICATION EMAIL

    const emailResponse = await sendVerificationEmails(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return NextResponse.json(emailResponse, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully. Please Verify your email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "Error registering user" },
      { status: 500 }
    );
  }
}
