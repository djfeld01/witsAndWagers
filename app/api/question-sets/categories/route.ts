import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { categories, questionSets } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Query categories with question set counts
    const categoriesWithCounts = await db
      .select({
        id: categories.id,
        name: categories.name,
        displayOrder: categories.displayOrder,
        questionSetCount: sql<number>`count(${questionSets.id})::int`,
      })
      .from(categories)
      .leftJoin(questionSets, sql`${questionSets.categoryId} = ${categories.id}`)
      .groupBy(categories.id, categories.name, categories.displayOrder)
      .orderBy(categories.displayOrder);

    return NextResponse.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: { message: "Failed to fetch categories" } },
      { status: 500 }
    );
  }
}
