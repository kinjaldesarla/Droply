import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, parentId } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    if (parentId) {
      const [parentFolder] = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.userId, userId),
            eq(files.id, parentId),
            eq(files.isFolder, true)
          )
        );

      if (!parentFolder) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 404 }
        );
      }
    }

    const id = uuidv4();

    const folderData = {
      id,
      name: name.trim(),
      path: `/folders/${userId}/${id}`,
      size: 0,
      type: "folder",
      fileUrl: "",
      thumbnailUrl: null,
      userId,
      parentId: parentId || null,
      isFolder: true,
      isStarred: false,
      isTrash: false,
    };

    const [newFolder] = await db.insert(files).values(folderData).returning();

    return NextResponse.json({
      success: true,
      folder: newFolder,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}