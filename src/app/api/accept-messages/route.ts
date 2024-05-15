import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";
import { PrismaClient } from "@prisma/client";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function POST(req: NextRequest,res: NextResponse) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized Access",
        },
        {
          status: 401,
        }
      );
    }

    const userId = user._id;
    const { acceptMessages } = await req.json();
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isAcceptingMessages: acceptMessages,
      },
    });
   

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "failed to update user status to accept messages",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "updated user status to accept messages",
        updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "failed to update user status to accept messages",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req: NextRequest,res: NextResponse) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User;

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized Access",
        },
        {
          status: 401,
        }
      );
    }

    const isUserExist = await prisma.user.findUnique({
      where: {
        id: user._id,
      },
    });

    if (!isUserExist) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User found",
        isAcceptingMessages: isUserExist.isAcceptingMessages,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Error in getting user status for accepting messages",
      },
      {
        status: 500,
      }
    );
  }
}
