import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";
import { PrismaClient } from "@prisma/client";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { username, content } = await req.json();
    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessages) {
      return NextResponse.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        { status: 400 }
      );
    }
    const newMessage = await prisma.messages.create({
      data: {
        content,
        createdAt: new Date(),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    if (!newMessage) {
      return NextResponse.json({
        success: false,
        message: "Something went wrong",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.log("Error sending message",error);
    return NextResponse.json({
      success: false,
      message: "Error sending message",  
    });
  }
}
