import { db } from "./client";
import { categories, questionSets, questionSetQuestions } from "./schema";
import { randomUUID } from "crypto";

// Seed data for pre-made question sets
export async function seedQuestionSets() {
  console.log("Seeding question sets...");

  // Create categories
  const categoryData = [
    { id: randomUUID(), name: "General Knowledge", displayOrder: 1 },
    { id: randomUUID(), name: "Science", displayOrder: 2 },
    { id: randomUUID(), name: "History", displayOrder: 3 },
    { id: randomUUID(), name: "Pop Culture", displayOrder: 4 },
    { id: randomUUID(), name: "Sports", displayOrder: 5 },
    { id: randomUUID(), name: "Geography", displayOrder: 6 },
  ];

  await db.insert(categories).values(categoryData);
  console.log("✓ Created 6 categories");

  // Helper function to create question sets
  const createQuestionSet = async (
    categoryId: string,
    name: string,
    description: string,
    questions: Array<{
      text: string;
      subText?: string;
      correctAnswer: string;
      answerFormat: "plain" | "currency" | "date" | "percentage";
      followUpNotes?: string;
    }>
  ) => {
    const setId = randomUUID();
    await db.insert(questionSets).values({
      id: setId,
      categoryId,
      name,
      description,
      questionCount: questions.length,
    });

    const questionData = questions.map((q, index) => ({
      id: randomUUID(),
      questionSetId: setId,
      orderIndex: index,
      ...q,
    }));

    await db.insert(questionSetQuestions).values(questionData);
  };

  // General Knowledge Question Sets
  const generalKnowledgeId = categoryData[0].id;

  await createQuestionSet(
    generalKnowledgeId,
    "World Records",
    "Questions about world records and extremes",
    [
      {
        text: "What is the height of Mount Everest in feet?",
        correctAnswer: "29032",
        answerFormat: "plain",
        followUpNotes: "Mount Everest is the tallest mountain on Earth",
      },
      {
        text: "How many countries are there in the world?",
        correctAnswer: "195",
        answerFormat: "plain",
      },
      {
        text: "What is the population of Earth in billions?",
        correctAnswer: "8",
        answerFormat: "plain",
        followUpNotes: "As of 2024, Earth's population is approximately 8 billion",
      },
      {
        text: "How many bones are in the adult human body?",
        correctAnswer: "206",
        answerFormat: "plain",
      },
      {
        text: "What is the speed of light in miles per second?",
        correctAnswer: "186282",
        answerFormat: "plain",
      },
    ]
  );

  await createQuestionSet(
    generalKnowledgeId,
    "Numbers & Measurements",
    "Questions about common measurements and quantities",
    [
      {
        text: "How many days are in a leap year?",
        correctAnswer: "366",
        answerFormat: "plain",
      },
      {
        text: "How many inches are in a foot?",
        correctAnswer: "12",
        answerFormat: "plain",
      },
      {
        text: "How many ounces are in a pound?",
        correctAnswer: "16",
        answerFormat: "plain",
      },
      {
        text: "How many degrees are in a circle?",
        correctAnswer: "360",
        answerFormat: "plain",
      },
      {
        text: "How many minutes are in a day?",
        correctAnswer: "1440",
        answerFormat: "plain",
      },
    ]
  );

  await createQuestionSet(
    generalKnowledgeId,
    "Famous Landmarks",
    "Questions about world-famous structures and monuments",
    [
      {
        text: "In what year was the Eiffel Tower completed?",
        correctAnswer: "1889",
        answerFormat: "date",
        followUpNotes: "The Eiffel Tower was built for the 1889 World's Fair",
      },
      {
        text: "How many steps are there to the top of the Eiffel Tower?",
        correctAnswer: "1665",
        answerFormat: "plain",
      },
      {
        text: "How tall is the Statue of Liberty in feet (from ground to torch)?",
        correctAnswer: "305",
        answerFormat: "plain",
      },
      {
        text: "How many stones were used to build the Great Pyramid of Giza (in millions)?",
        correctAnswer: "2.3",
        answerFormat: "plain",
      },
      {
        text: "How long is the Great Wall of China in miles?",
        correctAnswer: "13171",
        answerFormat: "plain",
      },
    ]
  );

  // Science Question Sets
  const scienceId = categoryData[1].id;

  await createQuestionSet(
    scienceId,
    "Solar System Facts",
    "Questions about our solar system",
    [
      {
        text: "How many planets are in our solar system?",
        correctAnswer: "8",
        answerFormat: "plain",
      },
      {
        text: "How many moons does Jupiter have?",
        correctAnswer: "95",
        answerFormat: "plain",
        followUpNotes: "Jupiter has the most moons of any planet",
      },
      {
        text: "How many days does it take Earth to orbit the Sun?",
        correctAnswer: "365",
        answerFormat: "plain",
      },
      {
        text: "What is the temperature of the Sun's surface in Fahrenheit?",
        correctAnswer: "10000",
        answerFormat: "plain",
      },
      {
        text: "How many light minutes away is the Sun from Earth?",
        correctAnswer: "8",
        answerFormat: "plain",
      },
    ]
  );

  await createQuestionSet(
    scienceId,
    "Human Body",
    "Questions about human anatomy and physiology",
    [
      {
        text: "What percentage of the human body is water?",
        correctAnswer: "60",
        answerFormat: "percentage",
      },
      {
        text: "How many teeth does an adult human have?",
        correctAnswer: "32",
        answerFormat: "plain",
      },
      {
        text: "What is normal human body temperature in Fahrenheit?",
        correctAnswer: "98.6",
        answerFormat: "plain",
      },
      {
        text: "How many chambers does the human heart have?",
        correctAnswer: "4",
        answerFormat: "plain",
      },
      {
        text: "How many pairs of ribs does a human have?",
        correctAnswer: "12",
        answerFormat: "plain",
      },
    ]
  );

  await createQuestionSet(
    scienceId,
    "Chemistry Basics",
    "Questions about elements and chemistry",
    [
      {
        text: "How many elements are in the periodic table?",
        correctAnswer: "118",
        answerFormat: "plain",
      },
      {
        text: "At what temperature does water freeze in Fahrenheit?",
        correctAnswer: "32",
        answerFormat: "plain",
      },
      {
        text: "At what temperature does water boil in Fahrenheit?",
        correctAnswer: "212",
        answerFormat: "plain",
      },
      {
        text: "What is the atomic number of carbon?",
        correctAnswer: "6",
        answerFormat: "plain",
      },
      {
        text: "What is the atomic number of oxygen?",
        correctAnswer: "8",
        answerFormat: "plain",
      },
    ]
  );

  // History Question Sets
  const historyId = categoryData[2].id;

  await createQuestionSet(
    historyId,
    "American History",
    "Questions about United States history",
    [
      {
        text: "In what year did the United States declare independence?",
        correctAnswer: "1776",
        answerFormat: "date",
      },
      {
        text: "How many original colonies were there?",
        correctAnswer: "13",
        answerFormat: "plain",
      },
      {
        text: "In what year did World War II end?",
        correctAnswer: "1945",
        answerFormat: "date",
      },
      {
        text: "How many amendments are in the Bill of Rights?",
        correctAnswer: "10",
        answerFormat: "plain",
      },
      {
        text: "In what year did man first land on the moon?",
        correctAnswer: "1969",
        answerFormat: "date",
      },
    ]
  );

  await createQuestionSet(
    historyId,
    "World Wars",
    "Questions about the World Wars",
    [
      {
        text: "In what year did World War I begin?",
        correctAnswer: "1914",
        answerFormat: "date",
      },
      {
        text: "In what year did World War I end?",
        correctAnswer: "1918",
        answerFormat: "date",
      },
      {
        text: "In what year did World War II begin?",
        correctAnswer: "1939",
        answerFormat: "date",
      },
      {
        text: "How many years did World War II last?",
        correctAnswer: "6",
        answerFormat: "plain",
      },
      {
        text: "In what year was the atomic bomb dropped on Hiroshima?",
        correctAnswer: "1945",
        answerFormat: "date",
      },
    ]
  );

  await createQuestionSet(
    historyId,
    "Ancient Civilizations",
    "Questions about ancient history",
    [
      {
        text: "In what year did the Roman Empire fall?",
        correctAnswer: "476",
        answerFormat: "date",
      },
      {
        text: "How many wonders of the ancient world were there?",
        correctAnswer: "7",
        answerFormat: "plain",
      },
      {
        text: "In what year was Julius Caesar assassinated?",
        correctAnswer: "44",
        answerFormat: "date",
        followUpNotes: "Julius Caesar was assassinated on the Ides of March (March 15), 44 BC",
      },
      {
        text: "How many years did the Byzantine Empire last (approximately)?",
        correctAnswer: "1000",
        answerFormat: "plain",
      },
      {
        text: "In what year did Alexander the Great die?",
        correctAnswer: "323",
        answerFormat: "date",
      },
    ]
  );

  // Pop Culture Question Sets
  const popCultureId = categoryData[3].id;

  await createQuestionSet(
    popCultureId,
    "Movies & Box Office",
    "Questions about popular movies",
    [
      {
        text: "How much did Avatar gross worldwide in billions?",
        correctAnswer: "2.9",
        answerFormat: "currency",
        followUpNotes: "Avatar is the highest-grossing film of all time",
      },
      {
        text: "In what year was the first Star Wars movie released?",
        correctAnswer: "1977",
        answerFormat: "date",
      },
      {
        text: "How many Harry Potter movies are there?",
        correctAnswer: "8",
        answerFormat: "plain",
      },
      {
        text: "How many Academy Awards did Titanic win?",
        correctAnswer: "11",
        answerFormat: "plain",
      },
      {
        text: "In what year was The Godfather released?",
        correctAnswer: "1972",
        answerFormat: "date",
      },
    ]
  );

  await createQuestionSet(
    popCultureId,
    "Music Records",
    "Questions about music and musicians",
    [
      {
        text: "How many studio albums did The Beatles release?",
        correctAnswer: "13",
        answerFormat: "plain",
      },
      {
        text: "In what year did Elvis Presley die?",
        correctAnswer: "1977",
        answerFormat: "date",
      },
      {
        text: "How many Grammy Awards has Beyoncé won?",
        correctAnswer: "32",
        answerFormat: "plain",
        followUpNotes: "Beyoncé holds the record for most Grammy wins",
      },
      {
        text: "In what year was MTV launched?",
        correctAnswer: "1981",
        answerFormat: "date",
      },
      {
        text: "How many strings does a standard guitar have?",
        correctAnswer: "6",
        answerFormat: "plain",
      },
    ]
  );

  await createQuestionSet(
    popCultureId,
    "TV Shows",
    "Questions about television",
    [
      {
        text: "How many seasons of Friends were there?",
        correctAnswer: "10",
        answerFormat: "plain",
      },
      {
        text: "In what year did The Simpsons first air?",
        correctAnswer: "1989",
        answerFormat: "date",
      },
      {
        text: "How many seasons of Game of Thrones were there?",
        correctAnswer: "8",
        answerFormat: "plain",
      },
      {
        text: "How many episodes of Seinfeld were made?",
        correctAnswer: "180",
        answerFormat: "plain",
      },
      {
        text: "In what year did Breaking Bad premiere?",
        correctAnswer: "2008",
        answerFormat: "date",
      },
    ]
  );

  // Sports Question Sets
  const sportsId = categoryData[4].id;

  await createQuestionSet(
    sportsId,
    "Olympic Games",
    "Questions about the Olympics",
    [
      {
        text: "How many gold medals did Michael Phelps win in his career?",
        correctAnswer: "23",
        answerFormat: "plain",
        followUpNotes: "Michael Phelps is the most decorated Olympian of all time",
      },
      {
        text: "In what year were the first modern Olympic Games held?",
        correctAnswer: "1896",
        answerFormat: "date",
      },
      {
        text: "How many rings are in the Olympic logo?",
        correctAnswer: "5",
        answerFormat: "plain",
      },
      {
        text: "How many events are in a decathlon?",
        correctAnswer: "10",
        answerFormat: "plain",
      },
      {
        text: "In what year did the United States boycott the Olympics?",
        correctAnswer: "1980",
        answerFormat: "date",
      },
    ]
  );

  await createQuestionSet(
    sportsId,
    "Professional Sports",
    "Questions about pro sports leagues",
    [
      {
        text: "How many teams are in the NFL?",
        correctAnswer: "32",
        answerFormat: "plain",
      },
      {
        text: "How many teams are in the NBA?",
        correctAnswer: "30",
        answerFormat: "plain",
      },
      {
        text: "How many players are on a baseball team's active roster?",
        correctAnswer: "26",
        answerFormat: "plain",
      },
      {
        text: "How many Super Bowls have the New England Patriots won?",
        correctAnswer: "6",
        answerFormat: "plain",
      },
      {
        text: "In what year was the first Super Bowl played?",
        correctAnswer: "1967",
        answerFormat: "date",
      },
    ]
  );

  await createQuestionSet(
    sportsId,
    "Sports Records",
    "Questions about sports records and achievements",
    [
      {
        text: "How many home runs did Babe Ruth hit in his career?",
        correctAnswer: "714",
        answerFormat: "plain",
      },
      {
        text: "How many points did Wilt Chamberlain score in a single game?",
        correctAnswer: "100",
        answerFormat: "plain",
      },
      {
        text: "How many Grand Slam titles did Roger Federer win?",
        correctAnswer: "20",
        answerFormat: "plain",
      },
      {
        text: "How many career touchdowns did Jerry Rice score?",
        correctAnswer: "208",
        answerFormat: "plain",
      },
      {
        text: "In what year did Tiger Woods win his first Masters?",
        correctAnswer: "1997",
        answerFormat: "date",
      },
    ]
  );

  // Geography Question Sets
  const geographyId = categoryData[5].id;

  await createQuestionSet(
    geographyId,
    "World Geography",
    "Questions about countries and continents",
    [
      {
        text: "How many continents are there?",
        correctAnswer: "7",
        answerFormat: "plain",
      },
      {
        text: "What is the population of China in billions?",
        correctAnswer: "1.4",
        answerFormat: "plain",
      },
      {
        text: "How many states are in the United States?",
        correctAnswer: "50",
        answerFormat: "plain",
      },
      {
        text: "What is the area of Russia in million square miles?",
        correctAnswer: "6.6",
        answerFormat: "plain",
        followUpNotes: "Russia is the largest country by area",
      },
      {
        text: "How many time zones does Russia span?",
        correctAnswer: "11",
        answerFormat: "plain",
      },
    ]
  );

  await createQuestionSet(
    geographyId,
    "US Geography",
    "Questions about United States geography",
    [
      {
        text: "How many Great Lakes are there?",
        correctAnswer: "5",
        answerFormat: "plain",
      },
      {
        text: "What is the length of the Mississippi River in miles?",
        correctAnswer: "2340",
        answerFormat: "plain",
      },
      {
        text: "How many national parks are in the United States?",
        correctAnswer: "63",
        answerFormat: "plain",
      },
      {
        text: "What is the elevation of Death Valley in feet below sea level?",
        correctAnswer: "282",
        answerFormat: "plain",
      },
      {
        text: "How many states border Mexico?",
        correctAnswer: "4",
        answerFormat: "plain",
      },
    ]
  );

  await createQuestionSet(
    geographyId,
    "Oceans & Water",
    "Questions about oceans and bodies of water",
    [
      {
        text: "How many oceans are there?",
        correctAnswer: "5",
        answerFormat: "plain",
      },
      {
        text: "What percentage of Earth's surface is covered by water?",
        correctAnswer: "71",
        answerFormat: "percentage",
      },
      {
        text: "What is the deepest point in the ocean in feet?",
        correctAnswer: "36000",
        answerFormat: "plain",
        followUpNotes: "The Mariana Trench is the deepest part of the ocean",
      },
      {
        text: "How many miles long is the Nile River?",
        correctAnswer: "4135",
        answerFormat: "plain",
      },
      {
        text: "What is the average depth of the ocean in feet?",
        correctAnswer: "12100",
        answerFormat: "plain",
      },
    ]
  );

  console.log("✓ Created 18 question sets with 90 questions");
  console.log("Question sets seeded successfully!");
}

// Run if called directly
if (require.main === module) {
  seedQuestionSets()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error seeding question sets:", error);
      process.exit(1);
    });
}
