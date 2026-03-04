import { db } from "./client";
import { games, questions, players, guesses, bets } from "./schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create a sample game
    const gameId = nanoid();
    const joinCode = "TEST01";

    await db.insert(games).values({
      id: gameId,
      title: "Sample Trivia Game",
      joinCode: joinCode,
      currentQuestionId: null,
      currentPhase: "guessing",
    });

    console.log(`✓ Created game: ${gameId} (Join code: ${joinCode})`);

    // Create sample questions
    const question1Id = nanoid();
    const question2Id = nanoid();
    const question3Id = nanoid();

    await db.insert(questions).values([
      {
        id: question1Id,
        gameId: gameId,
        orderIndex: 0,
        text: "What is the population of Tokyo in millions?",
        subText: "As of 2023",
        correctAnswer: "37.4",
        answerFormat: "plain",
        followUpNotes:
          "Tokyo is the most populous metropolitan area in the world.",
      },
      {
        id: question2Id,
        gameId: gameId,
        orderIndex: 1,
        text: "How much did the Mona Lisa sell for in today's dollars?",
        subText: "Adjusted for inflation",
        correctAnswer: "870000000",
        answerFormat: "currency",
        followUpNotes:
          "The Mona Lisa was assessed at $100 million in 1962, equivalent to about $870 million today.",
      },
      {
        id: question3Id,
        gameId: gameId,
        orderIndex: 2,
        text: "In what year was the first iPhone released?",
        correctAnswer: "2007",
        answerFormat: "date",
        followUpNotes:
          "Steve Jobs unveiled the first iPhone on January 9, 2007.",
      },
    ]);

    console.log(`✓ Created 3 questions`);

    // Update game with first question
    await db
      .update(games)
      .set({ currentQuestionId: question1Id })
      .where(eq(games.id, gameId));

    // Create sample players
    const player1Id = nanoid();
    const player2Id = nanoid();
    const player3Id = nanoid();

    await db.insert(players).values([
      {
        id: player1Id,
        gameId: gameId,
        displayName: "Alice",
        score: 0,
      },
      {
        id: player2Id,
        gameId: gameId,
        displayName: "Bob",
        score: 0,
      },
      {
        id: player3Id,
        gameId: gameId,
        displayName: "Charlie",
        score: 0,
      },
    ]);

    console.log(`✓ Created 3 players`);

    // Create sample guesses for question 1
    const guess1Id = nanoid();
    const guess2Id = nanoid();
    const guess3Id = nanoid();

    await db.insert(guesses).values([
      {
        id: guess1Id,
        questionId: question1Id,
        playerId: player1Id,
        guess: "35",
      },
      {
        id: guess2Id,
        questionId: question1Id,
        playerId: player2Id,
        guess: "40",
      },
      {
        id: guess3Id,
        questionId: question1Id,
        playerId: player3Id,
        guess: "38",
      },
    ]);

    console.log(`✓ Created 3 guesses for question 1`);

    // Create sample bets for question 1
    await db.insert(bets).values([
      {
        id: nanoid(),
        questionId: question1Id,
        playerId: player1Id,
        guessId: guess3Id, // Alice bets on Charlie's guess
        betOnZero: 0,
      },
      {
        id: nanoid(),
        questionId: question1Id,
        playerId: player2Id,
        guessId: guess3Id, // Bob bets on Charlie's guess
        betOnZero: 0,
      },
      {
        id: nanoid(),
        questionId: question1Id,
        playerId: player3Id,
        guessId: guess3Id, // Charlie bets on their own guess
        betOnZero: 0,
      },
    ]);

    console.log(`✓ Created 3 bets for question 1`);

    console.log("\n✅ Database seeded successfully!");
    console.log(`\nGame details:`);
    console.log(`  - Game ID: ${gameId}`);
    console.log(`  - Join Code: ${joinCode}`);
    console.log(`  - Players: Alice, Bob, Charlie`);
    console.log(`  - Questions: 3`);
    console.log(`  - Current Phase: guessing`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
