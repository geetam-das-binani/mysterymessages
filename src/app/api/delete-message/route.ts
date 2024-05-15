import { PrismaClient } from "@prisma/client";
import { User, getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "../auth/[...nextauth]/options";
const prisma = new PrismaClient();

export async function DELETE(
  req: NextRequest,

  // { params }: { params: { messageId: string }}
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as User;
  if (!session || !session.user) {
    return NextResponse.json({
      success: false,
      message: "Unauthorized Access",
    });
  }
  const { searchParams } = new URL(req.url);

  const messageId = searchParams.get("messageId");
  

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        username: user.username,
      },
      include: {
        messages: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        messages: {
          delete: {
            id: messageId as string,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Something went wrong while deleting the message",
    });
  }
}
