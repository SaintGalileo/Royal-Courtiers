import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  QUESTION_TIME_MS,
  QUESTIONS_PER_ROUND,
  READ_POINTS,
  roundPoints,
  scoreTimedAnswer,
  type CorrectOption,
} from "@/lib/sacred-records-game";

type AnswerPayload = {
  id: string;
  choice: CorrectOption;
  remainingMs: number;
};

type Body = {
  userId: string;
  dayNumber: number;
  recordId: string;
  answers: AnswerPayload[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const { userId, dayNumber, recordId, answers } = body;

    if (
      !userId ||
      !recordId ||
      typeof dayNumber !== "number" ||
      !Array.isArray(answers)
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (answers.length !== QUESTIONS_PER_ROUND) {
      return NextResponse.json(
        { error: `Exactly ${QUESTIONS_PER_ROUND} answers required` },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: existing, error: existingError } = await supabase
      .from("user_progress")
      .select("completed, points_earned")
      .eq("user_id", userId)
      .eq("day_number", dayNumber)
      .maybeSingle();

    if (existingError) {
      console.error(existingError);
      return NextResponse.json(
        { error: "Failed to check progress" },
        { status: 500 },
      );
    }

    if (existing?.completed) {
      return NextResponse.json(
        {
          error: "Day already completed",
          pointsEarned: Number(existing.points_earned) || 0,
        },
        { status: 409 },
      );
    }

    const { data: record, error: recordError } = await supabase
      .from("sacred_records")
      .select("id, day_number")
      .eq("id", recordId)
      .maybeSingle();

    if (recordError || !record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if (record.day_number !== dayNumber) {
      return NextResponse.json(
        { error: "Day number does not match record" },
        { status: 400 },
      );
    }

    const answerIds = answers.map((a) => a.id);
    if (new Set(answerIds).size !== answerIds.length) {
      return NextResponse.json(
        { error: "Duplicate question answers" },
        { status: 400 },
      );
    }

    const { data: questions, error: questionsError } = await supabase
      .from("sacred_record_questions")
      .select("id, correct_option, record_id")
      .in("id", answerIds);

    if (questionsError) {
      console.error(questionsError);
      return NextResponse.json(
        { error: "Failed to load questions" },
        { status: 500 },
      );
    }

    if (!questions || questions.length !== QUESTIONS_PER_ROUND) {
      return NextResponse.json(
        { error: "Invalid question set" },
        { status: 400 },
      );
    }

    if (questions.some((q) => q.record_id !== recordId)) {
      return NextResponse.json(
        { error: "Questions do not belong to this record" },
        { status: 400 },
      );
    }

    const byId = new Map(questions.map((q) => [q.id, q]));
    const perQuestion: number[] = [];

    for (const answer of answers) {
      const question = byId.get(answer.id);
      if (!question) {
        return NextResponse.json(
          { error: "Unknown question" },
          { status: 400 },
        );
      }
      const remainingMs = Math.max(
        0,
        Math.min(QUESTION_TIME_MS, Number(answer.remainingMs) || 0),
      );
      const correct = answer.choice === question.correct_option;
      perQuestion.push(scoreTimedAnswer(correct, remainingMs));
    }

    const quizPoints = roundPoints(perQuestion.reduce((s, n) => s + n, 0));
    const pointsEarned = roundPoints(READ_POINTS + quizPoints);
    const finalizedAt = new Date().toISOString();

    const quiz_scores = {
      questionIds: answerIds,
      perQuestion,
      readPoints: READ_POINTS,
      quizPoints,
      finalized_at: finalizedAt,
    };

    const { error: upsertError } = await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        day_number: dayNumber,
        completed: true,
        points_earned: pointsEarned,
        completed_at: finalizedAt,
        quiz_scores,
      },
      { onConflict: "user_id, day_number" },
    );

    if (upsertError) {
      console.error(upsertError);
      return NextResponse.json(
        { error: "Failed to save progress" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      pointsEarned,
      readPoints: READ_POINTS,
      quizPoints,
      perQuestion,
    });
  } catch (error) {
    console.error("sacred-records complete error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
