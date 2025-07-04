"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { streamServer } from "@/lib/stream-server"; // Changed import
import { getUserDataSelect } from "@/lib/types";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from "@/lib/validation";

export async function updateUserProfile(values: UpdateUserProfileValues) {
  const validatedValues = updateUserProfileSchema.parse(values);

  console.log(
    "STREAM_API_KEY:",
    process.env.NEXT_PUBLIC_STREAM_KEY ? "Present" : "Missing",
  );
  console.log(
    "STREAM_API_SECRET:",
    process.env.STREAM_SECRET ? "Present" : "Missing",
  );

  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: validatedValues,
      select: getUserDataSelect(user.id),
    });

    try {
      await streamServer.upsertUser({
        // Use streamServer instead
        id: user.id,
        set: {
          name: validatedValues.displayName,
        },
      });
    } catch (streamError) {
      console.error("Stream update failed:", streamError);
    }

    return updatedUser;
  });

  return updatedUser;
}
