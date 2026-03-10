import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { questionSetQuestions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await params;

    // Query questions for the specified question set
    const questions = await db
      .select({
        id: questionSetQuestions.id,
        text: questionSetQuestions.text,
        subText: questionSetQuestions.subText,
        correctAnswer: questionSetQuestions.correctAnswer,
        answerFormat: questionSetQuestions.answerFormat,
        followUpNotes: questionSetQuestions.followUpNotes,
        orderIndex: questionSetQuestions.orderIndex,
        roundCurrency: questionSetQuestions.roundCurrency,
      })
      .from(questionSetQuestions)
      .where(eq(questionSetQuestions.questionSetId, setId))
      .orderBy(asc(questionSetQuestions.orderIndex));

    if (questions.length === 0) {
      return NextResponse.json(
        { error: { message: "Question set not found" } },
        { status: 404 }
      );
    }

    // Convert roundCurrency from integer to boolean
    const questionsWithBooleanRoundCurrency = questions.map(q => ({
      ...q,
      roundCurrency: q.roundCurrency === null ? null : q.roundCurrency === 1,
    }));

    return NextResponse.json({ questions: questionsWithBooleanRoundCurrency });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: { message: "Failed to fetch questions" } },
      { status: 500 }
    );
  }
}
