import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { categories, questionSets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        { error: { message: "categoryId parameter is required" } },
        { status: 400 }
      );
    }

    // Query question sets for the specified category
    const sets = await db
      .select({
        id: questionSets.id,
        name: questionSets.name,
        description: questionSets.description,
        questionCount: questionSets.questionCount,
        categoryName: categories.name,
      })
      .from(questionSets)
      .innerJoin(categories, eq(questionSets.categoryId, categories.id))
      .where(eq(questionSets.categoryId, categoryId));

    return NextResponse.json({ questionSets: sets });
  } catch (error) {
    console.error("Error fetching question sets:", error);
    return NextResponse.json(
      { error: { message: "Failed to fetch question sets" } },
      { status: 500 }
    );
  }
}
