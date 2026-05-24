/**
 * GandaBot — Luganda Beginner Curriculum (A1)
 *
 * 30 lessons across 6 units, each lesson containing:
 *   • 5 vocabulary words with example sentences
 *   • 1 grammar note (point, explanation, example)
 *   • 2 multiple-choice exercises
 *
 * Lessons are gated sequentially: lesson N+1 unlocks only after N is complete.
 * Unit N+1 unlocks after all 5 lessons of unit N are complete.
 *
 * XP per completed lesson: 50 XP (via /api/lessons/progress POST).
 */

export interface VocabWord {
  word:    string;   // Luganda word / phrase
  meaning: string;   // English translation
  example: string;   // Luganda example sentence (English in parens)
}

export interface GrammarNote {
  point:       string;   // short title, e.g. "Subject Pronoun 'Ndi'"
  explanation: string;   // plain-English rule explanation
  example:     string;   // Luganda example with English translation
}

export interface Exercise {
  question: string;
  options:  string[];   // always 4 options
  answer:   string;     // must match one of options exactly
}

export interface Lesson {
  id:         number;   // 1–30
  unit:       number;   // 1–6
  unitTitle:  string;
  title:      string;
  vocab:      VocabWord[];   // exactly 5
  grammar:    GrammarNote;
  exercises:  Exercise[];    // exactly 2
}

// ─── Curriculum data ──────────────────────────────────────────────────────────

export const LESSONS: Lesson[] = [

  // ── Unit 1: Okusaliira (Greetings & Salutations) ──────────────────────────

  {
    id: 1, unit: 1, unitTitle: "Greetings", title: "Basic Greetings",
    vocab: [
      { word: "Oli otya?",   meaning: "How are you?",         example: "Oli otya, Ssebo? (How are you, Sir?)" },
      { word: "Bulungi",     meaning: "Fine / Good",           example: "Ndi bulungi. (I am fine.)" },
      { word: "Weebale",     meaning: "Thank you",             example: "Weebale nnyo! (Thank you very much!)" },
      { word: "Kale",        meaning: "OK / Alright",          example: "Kale, tugende. (OK, let's go.)" },
      { word: "Mpulira",     meaning: "I understand / I hear", example: "Mpulira, Nnyabo. (I understand, Madam.)" },
    ],
    grammar: {
      point:       "The greeting 'Oli otya?'",
      explanation: "'Oli otya?' literally means 'How are you being?' It is the standard everyday greeting. Reply with 'Gyendi' (I'm going / I'm okay) or 'Bulungi' (Fine).",
      example:     "A: Oli otya? — B: Gyendi, weebale. (A: How are you? — B: I'm fine, thank you.)",
    },
    exercises: [
      {
        question: "What does 'Weebale' mean?",
        options:  ["How are you?", "Thank you", "Goodbye", "Please"],
        answer:   "Thank you",
      },
      {
        question: "'Ndi bulungi' means:",
        options:  ["I am sick", "I am tired", "I am fine", "I am hungry"],
        answer:   "I am fine",
      },
    ],
  },

  {
    id: 2, unit: 1, unitTitle: "Greetings", title: "Introductions",
    vocab: [
      { word: "Erinnya lyange", meaning: "My name is",       example: "Erinnya lyange nze Maria. (My name is Maria.)" },
      { word: "Nze",            meaning: "I / Me",            example: "Nze ssomesa. (I am a teacher.)" },
      { word: "Nnyabo",         meaning: "Madam / Ms.",       example: "Kale, Nnyabo. (Yes, Madam.)" },
      { word: "Ssebo",          meaning: "Sir / Mr.",         example: "Ssebo, mpulira. (Sir, I understand.)" },
      { word: "Tutuuse",        meaning: "Nice to meet you",  example: "Tutuuse, Ssebo. (Nice to meet you, Sir.)" },
    ],
    grammar: {
      point:       "Time-of-Day Greetings",
      explanation: "Luganda uses different greetings for different times of day: 'Wasuze otya?' (Good morning, lit. How did you sleep?), 'Osibye otya?' (Good afternoon), 'Oiriidde otya?' (Good evening).",
      example:     "Wasuze otya, Ssebo? — Wasuze bulungi. (Good morning, Sir? — Good morning / I slept well.)",
    },
    exercises: [
      {
        question: "What does 'Erinnya lyange' mean?",
        options:  ["How are you?", "I am fine", "My name is", "Goodbye"],
        answer:   "My name is",
      },
      {
        question: "How do you say 'Good morning' in Luganda?",
        options:  ["Osibye otya?", "Wasuze otya?", "Oiriidde otya?", "Oli otya?"],
        answer:   "Wasuze otya?",
      },
    ],
  },

  {
    id: 3, unit: 1, unitTitle: "Greetings", title: "Polite Expressions",
    vocab: [
      { word: "Nsaba",      meaning: "I request / Please", example: "Nsaba amazzi. (Please give me water.)" },
      { word: "Yego",       meaning: "Yes",                example: "Yego, Ssebo. (Yes, Sir.)" },
      { word: "Nedda",      meaning: "No",                 example: "Nedda, weebale. (No, thank you.)" },
      { word: "Simanyi",    meaning: "I don't know",       example: "Simanyi ekyafaayo. (I don't know what happened.)" },
      { word: "Kitalo",     meaning: "Sorry / That's sad", example: "Kitalo nnyo. (I'm very sorry.)" },
    ],
    grammar: {
      point:       "Negation with 'Si-'",
      explanation: "To negate verbs in Luganda, add 'si' as a prefix. 'Nmanyi' (I know) → 'Simanyi' (I don't know). 'Nsobola' (I can) → 'Sisobola' (I cannot).",
      example:     "Sisobola kujja leero. (I cannot come today.)",
    },
    exercises: [
      {
        question: "How do you say 'Yes' in Luganda?",
        options:  ["Nedda", "Yego", "Kale", "Mpulira"],
        answer:   "Yego",
      },
      {
        question: "What does 'Simanyi' mean?",
        options:  ["I understand", "I know", "I don't know", "I see"],
        answer:   "I don't know",
      },
    ],
  },

  {
    id: 4, unit: 1, unitTitle: "Greetings", title: "Numbers 1–5",
    vocab: [
      { word: "Emu",    meaning: "One",   example: "Omuntu omu. (One person.)" },
      { word: "Bbiri",  meaning: "Two",   example: "Endiga bbiri. (Two goats.)" },
      { word: "Ssatu",  meaning: "Three", example: "Ennyumba ssatu. (Three houses.)" },
      { word: "Nnya",   meaning: "Four",  example: "Ebikkopo nnya. (Four cups.)" },
      { word: "Ttaano", meaning: "Five",  example: "Abasomi ttaano. (Five students.)" },
    ],
    grammar: {
      point:       "Numbers 6–10",
      explanation: "Numbers continue: Mukaaga (6), Musanvu (7), Munaana (8), Mwenda (9), Kkumi (10). To say 11: Kkumi n'emu (ten and one).",
      example:     "Empapula munaana. (Eight papers.) | Kkumi n'emu = 11.",
    },
    exercises: [
      {
        question: "What is 'Bbiri' in Luganda?",
        options:  ["One", "Three", "Two", "Four"],
        answer:   "Two",
      },
      {
        question: "How do you say 'Ten' in Luganda?",
        options:  ["Ttaano", "Mukaaga", "Mwenda", "Kkumi"],
        answer:   "Kkumi",
      },
    ],
  },

  {
    id: 5, unit: 1, unitTitle: "Greetings", title: "Days of the Week",
    vocab: [
      { word: "Bbalaza",    meaning: "Monday",    example: "Bbalaza njja. (I will come on Monday.)" },
      { word: "Lwakubiri",  meaning: "Tuesday",   example: "Lwakubiri nkola. (I work on Tuesday.)" },
      { word: "Lwakusatu",  meaning: "Wednesday", example: "Lwakusatu mboozi. (Meeting on Wednesday.)" },
      { word: "Lwakuna",    meaning: "Thursday",  example: "Lwakuna ssomero. (School on Thursday.)" },
      { word: "Sabbiiti",   meaning: "Sunday",    example: "Sabbiiti ekkanisa. (Church on Sunday.)" },
    ],
    grammar: {
      point:       "Remaining Days: Friday & Saturday",
      explanation: "'Lwakutaano' = Friday, 'Lwamukaaga' = Saturday. The prefix 'Lwaku-' means 'on the day of'. 'Sabbiiti' comes from the word Sabbath.",
      example:     "Lwakutaano nkola. (On Friday I work.) | Lwamukaaga nsoma. (On Saturday I study.)",
    },
    exercises: [
      {
        question: "What does 'Bbalaza' mean?",
        options:  ["Tuesday", "Sunday", "Monday", "Wednesday"],
        answer:   "Monday",
      },
      {
        question: "How do you say 'Saturday' in Luganda?",
        options:  ["Lwakuna", "Lwamukaaga", "Lwakutaano", "Sabbiiti"],
        answer:   "Lwamukaaga",
      },
    ],
  },

  // ── Unit 2: Mu Nju (At Home) ───────────────────────────────────────────────

  {
    id: 6, unit: 2, unitTitle: "At Home", title: "Family Members",
    vocab: [
      { word: "Taata",  meaning: "Father",      example: "Taata wange. (My father.)" },
      { word: "Maama",  meaning: "Mother",       example: "Maama wa Julie. (Julie's mother.)" },
      { word: "Muganda",meaning: "Sibling",      example: "Muganda wange omwami. (My older sibling.)" },
      { word: "Mwana",  meaning: "Child / Son",  example: "Mwana wange. (My child.)" },
      { word: "Jjajja", meaning: "Grandparent",  example: "Jjajja wa Charles. (Charles's grandmother.)" },
    ],
    grammar: {
      point:       "Possessives: 'wange' (my), 'wo' (your)",
      explanation: "To say 'my [person]', add '-wange' after the noun. For 'your', add '-wo'. These are possessive suffixes for people and animals.",
      example:     "Taata wange = my father | Maama wo = your mother | Mwana wange = my child",
    },
    exercises: [
      {
        question: "What does 'Jjajja' mean?",
        options:  ["Father", "Child", "Sibling", "Grandparent"],
        answer:   "Grandparent",
      },
      {
        question: "How do you say 'my father' in Luganda?",
        options:  ["Taata we", "Taata wange", "Taata bo", "Taata yo"],
        answer:   "Taata wange",
      },
    ],
  },

  {
    id: 7, unit: 2, unitTitle: "At Home", title: "Parts of the House",
    vocab: [
      { word: "Ennyumba", meaning: "House",    example: "Ennyumba yange ennene. (My house is big.)" },
      { word: "Oluggya",  meaning: "Yard / Compound", example: "Abaana balina mu luggya. (Children are in the yard.)" },
      { word: "Ekisenge", meaning: "Room / Bedroom", example: "Ekisenge kyange kimu. (I have one bedroom.)" },
      { word: "Omulyango",meaning: "Door",     example: "Ggala omulyango. (Close the door.)" },
      { word: "Olukiiko", meaning: "Table",    example: "Ddira ku lukiiko. (Eat at the table.)" },
    ],
    grammar: {
      point:       "Adjective Agreement: Size",
      explanation: "Adjectives in Luganda agree with the noun class. For 'ennene' (big): Ennyumba ennene (big house). For 'entono' (small): Ekisenge entono (small room).",
      example:     "Ennyumba ennene = big house | Olukiiko lutono = small table",
    },
    exercises: [
      {
        question: "What does 'Omulyango' mean?",
        options:  ["Window", "Roof", "Door", "Floor"],
        answer:   "Door",
      },
      {
        question: "How do you say 'house' in Luganda?",
        options:  ["Oluggya", "Ekisenge", "Ennyumba", "Olukiiko"],
        answer:   "Ennyumba",
      },
    ],
  },

  {
    id: 8, unit: 2, unitTitle: "At Home", title: "Colors",
    vocab: [
      { word: "Omutuku",  meaning: "Red",    example: "Effuluwa omutuku. (A red flower.)" },
      { word: "Omweru",   meaning: "White",  example: "Engoye omweru. (White clothes.)" },
      { word: "Omunaku",  meaning: "Black",  example: "Embalaasi omunaku. (A black car.)" },
      { word: "Omuguwa",  meaning: "Green",  example: "Omuti omuguwa. (A green tree.)" },
      { word: "Omukutu",  meaning: "Yellow / Orange", example: "Omugga omukutu. (An orange mango.)" },
    ],
    grammar: {
      point:       "Describing with Colors",
      explanation: "Color adjectives follow the noun and must agree in noun class. For most nouns starting with 'en-': Engoye enzeru (white cloth). Colors are also often heard as: -tuku (red), -eru (white), -ddugavu (black).",
      example:     "Embalaasi omunaku = a black car | Omuti omuguwa = a green tree",
    },
    exercises: [
      {
        question: "What does 'Omweru' mean?",
        options:  ["Red", "Black", "White", "Green"],
        answer:   "White",
      },
      {
        question: "How do you say 'red' in Luganda?",
        options:  ["Omuguwa", "Omutuku", "Omweru", "Omunaku"],
        answer:   "Omutuku",
      },
    ],
  },

  {
    id: 9, unit: 2, unitTitle: "At Home", title: "Daily Objects",
    vocab: [
      { word: "Ekitabo",  meaning: "Book",   example: "Soma ekitabo. (Read a book.)" },
      { word: "Akatalaasi",meaning: "Phone", example: "Akatalaasi kange. (My phone.)" },
      { word: "Amazzi",   meaning: "Water",  example: "Nnywa amazzi. (Drink water.)" },
      { word: "Emmere",   meaning: "Food",   example: "Emmere eri mu ttaka. (The food is on the table.)" },
      { word: "Engoye",   meaning: "Clothes",example: "Yambala engoye. (Wear/put on clothes.)" },
    ],
    grammar: {
      point:       "Imperative (Commands)",
      explanation: "In Luganda, the simple imperative is formed by using the verb stem. 'Soma!' (Read!), 'Nnywa!' (Drink!), 'Yambala!' (Wear/Put on!). For polite requests, add 'Nsaba' (I ask/please).",
      example:     "Soma ekitabo! (Read the book!) | Nsaba ompa amazzi. (Please give me water.)",
    },
    exercises: [
      {
        question: "What does 'Amazzi' mean?",
        options:  ["Food", "Fire", "Water", "Salt"],
        answer:   "Water",
      },
      {
        question: "How do you say 'book' in Luganda?",
        options:  ["Engoye", "Akatalaasi", "Emmere", "Ekitabo"],
        answer:   "Ekitabo",
      },
    ],
  },

  {
    id: 10, unit: 2, unitTitle: "At Home", title: "Simple Sentences",
    vocab: [
      { word: "Njagala",  meaning: "I want / I love",  example: "Njagala Luganda. (I love Luganda.)" },
      { word: "Nkola",    meaning: "I work / I do",    example: "Nkola ku bbalaza. (I work on Monday.)" },
      { word: "Nsoma",    meaning: "I study / I read", example: "Nsoma Luganda buli lunaku. (I study Luganda every day.)" },
      { word: "Ntuuka",   meaning: "I arrive",         example: "Ntuuka ku ssawa ttaano. (I arrive at 11 o'clock.)" },
      { word: "Nnenda",   meaning: "I go",             example: "Nnenda eka. (I go home.)" },
    ],
    grammar: {
      point:       "First Person Present Tense",
      explanation: "In Luganda, 'N-' prefix on verbs indicates first person (I). 'N-' + '-soma' = 'Nsoma' (I read). 'N-' + '-kola' = 'Nkola' (I work). The 'N-' prefix is the subject marker for 'I'.",
      example:     "Nsoma → I read | Nkola → I work | Njagala → I want/love | Nnenda → I go",
    },
    exercises: [
      {
        question: "What does 'Njagala' mean?",
        options:  ["I eat", "I sleep", "I want / I love", "I come"],
        answer:   "I want / I love",
      },
      {
        question: "'Nsoma Luganda' means:",
        options:  ["I speak Luganda", "I study Luganda", "I teach Luganda", "I write Luganda"],
        answer:   "I study Luganda",
      },
    ],
  },

  // ── Unit 3: Emmere (Food & Eating) ────────────────────────────────────────

  {
    id: 11, unit: 3, unitTitle: "Food & Eating", title: "Common Foods",
    vocab: [
      { word: "Matooke",  meaning: "Steamed plantain (staple food)", example: "Njagala matooke. (I like matooke.)" },
      { word: "Posho",    meaning: "Maize meal / Ugali",             example: "Posho n'ennyama. (Maize meal with meat.)" },
      { word: "Ennyama",  meaning: "Meat",                           example: "Nkula ennyama. (I buy meat.)" },
      { word: "Omugati",  meaning: "Bread",                          example: "Omugati n'amata. (Bread and milk.)" },
      { word: "Ebitooke", meaning: "Bananas (raw/cooking)",          example: "Ebitooke ebisaanyize. (Ripe bananas.)" },
    ],
    grammar: {
      point:       "Conjunctions: 'n'' (and)",
      explanation: "'N'' (a shortened form of 'na') means 'and' when connecting nouns. Before vowels it becomes 'na'. E.g., 'Posho na ennyama' (maize meal and meat), 'Omugati n'amata' (bread and milk).",
      example:     "Matooke n'ennyama = matooke and meat | Posho na muwogo = maize meal and cassava",
    },
    exercises: [
      {
        question: "What is 'Matooke'?",
        options:  ["Fried chicken", "Steamed plantain", "Rice dish", "Bean stew"],
        answer:   "Steamed plantain",
      },
      {
        question: "What does 'Ennyama' mean?",
        options:  ["Fish", "Vegetables", "Meat", "Bread"],
        answer:   "Meat",
      },
    ],
  },

  {
    id: 12, unit: 3, unitTitle: "Food & Eating", title: "Drinks",
    vocab: [
      { word: "Amata",    meaning: "Milk",   example: "Nnywa amata buli enkya. (I drink milk every morning.)" },
      { word: "Ekibiina", meaning: "Tea (Katogo)", example: "Nnywa ssikaali n'ecupa. (I drink tea with a bottle.)" },
      { word: "Chai",     meaning: "Tea (common loan word)", example: "Njagala chai. (I want tea.)" },
      { word: "Obwenge",  meaning: "Local brew / Beer",      example: "Obwenge bwa Uganda. (Ugandan local brew.)" },
      { word: "Juice",    meaning: "Juice (loan word)",       example: "Juice y'empafu. (Passion fruit juice.)" },
    ],
    grammar: {
      point:       "The verb 'Nnywa' (I drink)",
      explanation: "'Nnywa' means 'I drink'. Past tense: 'Nnywanga' (I used to drink) or 'Nnyweredde' (I have drunk). To say 'I want to drink': 'Njagala okunywa'.",
      example:     "Nnywa amazzi. (I drink water.) | Njagala okunywa chai. (I want to drink tea.)",
    },
    exercises: [
      {
        question: "What does 'Amata' mean?",
        options:  ["Water", "Milk", "Tea", "Juice"],
        answer:   "Milk",
      },
      {
        question: "How do you say 'I drink water'?",
        options:  ["Nkula amazzi", "Nnywa amazzi", "Ndya amazzi", "Nsoma amazzi"],
        answer:   "Nnywa amazzi",
      },
    ],
  },

  {
    id: 13, unit: 3, unitTitle: "Food & Eating", title: "Eating Phrases",
    vocab: [
      { word: "Ndya",      meaning: "I eat",             example: "Ndya emmere y'olunaku. (I eat the daily meal.)" },
      { word: "Nkula",     meaning: "I cook / I buy",    example: "Nkula emmere enkya. (I cook food in the morning.)" },
      { word: "Enkya",     meaning: "Morning",            example: "Enkya buli lunaku. (Every morning.)" },
      { word: "Akawungeezi",meaning: "Lunch / Afternoon", example: "Akawungeezi: ssawa mukaaga. (Afternoon: 12 o'clock.)" },
      { word: "Akabuzaala", meaning: "Evening meal / Dinner", example: "Ndya akabuzaala. (I eat dinner.)" },
    ],
    grammar: {
      point:       "Times of Day for Meals",
      explanation: "Luganda meal times: 'Enkya' (morning/breakfast), 'Akawungeezi' (midday/lunch), 'Akabuzaala' (evening/dinner). 'Buli' means 'every'.",
      example:     "Ndya enkya = I eat in the morning (breakfast) | Ndya akabuzaala = I eat dinner",
    },
    exercises: [
      {
        question: "What does 'Ndya' mean?",
        options:  ["I drink", "I cook", "I eat", "I buy"],
        answer:   "I eat",
      },
      {
        question: "What is 'Enkya' in Luganda?",
        options:  ["Evening", "Lunch", "Night", "Morning"],
        answer:   "Morning",
      },
    ],
  },

  {
    id: 14, unit: 3, unitTitle: "Food & Eating", title: "Hunger & Thirst",
    vocab: [
      { word: "Ndi na enzala", meaning: "I am hungry",       example: "Ndi na enzala nnyo. (I am very hungry.)" },
      { word: "Ndi na enyonta",meaning: "I am thirsty",      example: "Ndi na enyonta; mpe amazzi. (I'm thirsty; give me water.)" },
      { word: "Nojja",          meaning: "I am full (done eating)", example: "Nojja, weebale. (I am full, thank you.)" },
      { word: "Ogenda?",        meaning: "Do you want more?", example: "Ogenda emmere? (Do you want more food?)" },
      { word: "Tedda",          meaning: "Don't go",          example: "Tedda, kiraba nnyo. (Don't leave, it's very good.)" },
    ],
    grammar: {
      point:       "'Ndi na' (I have / I am with)",
      explanation: "'Ndi na' literally means 'I am with' but is used to express having or experiencing something. 'Ndi na enzala' = I have hunger = I am hungry. 'Ndi na essente' = I have money.",
      example:     "Ndi na enzala = I am hungry | Ndi na enyonta = I am thirsty | Ndi na essente = I have money",
    },
    exercises: [
      {
        question: "How do you say 'I am hungry' in Luganda?",
        options:  ["Ndi na enyonta", "Ndi na enzala", "Nojja", "Ndi na essente"],
        answer:   "Ndi na enzala",
      },
      {
        question: "What does 'Nojja' mean?",
        options:  ["I am hungry", "I want more", "I am full", "I am tired"],
        answer:   "I am full",
      },
    ],
  },

  {
    id: 15, unit: 3, unitTitle: "Food & Eating", title: "At the Market",
    vocab: [
      { word: "Katale",    meaning: "Market",      example: "Nenda ku katale. (I go to the market.)" },
      { word: "Nkula",     meaning: "I buy",       example: "Nkula emmere ku katale. (I buy food at the market.)" },
      { word: "Ssente",    meaning: "Money",       example: "Ndi na ssente nnyingi. (I have a lot of money.)" },
      { word: "Omuwendo",  meaning: "Price",       example: "Omuwendo gwange ntono. (My price is small/low.)" },
      { word: "Yambaza",   meaning: "Bargain / Haggle", example: "Yambaza omuwendo. (Haggle the price.)" },
    ],
    grammar: {
      point:       "Asking for a Price",
      explanation: "To ask the price: 'Mmeka?' or 'Kizza mmeka?' (How much is it?). To say something is cheap: 'Tono' (cheap/small amount). Expensive: 'Ogulika' (it's expensive).",
      example:     "Kizza mmeka? — Emisirikiti ssatu. (How much? — Three hundred shillings.)",
    },
    exercises: [
      {
        question: "What does 'Katale' mean?",
        options:  ["Shop", "Market", "Bank", "Restaurant"],
        answer:   "Market",
      },
      {
        question: "How do you ask 'How much is it?' in Luganda?",
        options:  ["Kizza mmeka?", "Nkula mmeka?", "Wasuze mmeka?", "Ogenda mmeka?"],
        answer:   "Kizza mmeka?",
      },
    ],
  },

  // ── Unit 4: Emyooga (Jobs & Daily Life) ──────────────────────────────────

  {
    id: 16, unit: 4, unitTitle: "Jobs & Daily Life", title: "Common Jobs",
    vocab: [
      { word: "Ssomesa",   meaning: "Teacher",   example: "Nze ssomesa. (I am a teacher.)" },
      { word: "Omusawo",   meaning: "Doctor",    example: "Omusawo wa ddwaliro. (The hospital doctor.)" },
      { word: "Omulimi",   meaning: "Farmer",    example: "Taata wange mulimi. (My father is a farmer.)" },
      { word: "Omwoozi",   meaning: "Carpenter", example: "Omwoozi akola olukiiko. (The carpenter makes a table.)" },
      { word: "Omutendesi",meaning: "Trader / Seller", example: "Omutendesi wa katale. (The market trader.)" },
    ],
    grammar: {
      point:       "Stating Your Profession",
      explanation: "To say 'I am a [job]', use 'Nze [profession]'. Unlike English, Luganda doesn't use the equivalent of 'a/an'. Example: 'Nze ssomesa' (I am teacher), not 'Nze ssomesa omu'.",
      example:     "Nze ssomesa. (I am a teacher.) | Nze omusawo. (I am a doctor.) | Nze omulimi. (I am a farmer.)",
    },
    exercises: [
      {
        question: "What does 'Ssomesa' mean?",
        options:  ["Doctor", "Farmer", "Teacher", "Trader"],
        answer:   "Teacher",
      },
      {
        question: "How do you say 'I am a farmer'?",
        options:  ["Nze omusawo", "Nze ssomesa", "Nze omulimi", "Nze omwoozi"],
        answer:   "Nze omulimi",
      },
    ],
  },

  {
    id: 17, unit: 4, unitTitle: "Jobs & Daily Life", title: "Daily Activities",
    vocab: [
      { word: "Nzuka",    meaning: "I wake up",  example: "Nzuka amasooka mu makya. (I wake up early in the morning.)" },
      { word: "Nnaabira", meaning: "I bathe",    example: "Nnaabira buli enkya. (I bathe every morning.)" },
      { word: "Nnenda",   meaning: "I go",       example: "Nnenda ku ssomero. (I go to school.)" },
      { word: "Nsubira",  meaning: "I return / come back", example: "Nsubira eka. (I return home.)" },
      { word: "Ntulo",    meaning: "I sleep",    example: "Ntulo akawungeezi. (I sleep at noon.)" },
    ],
    grammar: {
      point:       "Time with 'Buli' (Every)",
      explanation: "'Buli' means 'every' and is placed before a time word. 'Buli enkya' = every morning. 'Buli lunaku' = every day. 'Buli wiiki' = every week.",
      example:     "Nnaabira buli enkya. (I bathe every morning.) | Nsoma buli lunaku. (I study every day.)",
    },
    exercises: [
      {
        question: "What does 'Nzuka' mean?",
        options:  ["I sleep", "I eat", "I wake up", "I bathe"],
        answer:   "I wake up",
      },
      {
        question: "'Buli lunaku' means:",
        options:  ["Every week", "Every morning", "Every day", "Every month"],
        answer:   "Every day",
      },
    ],
  },

  {
    id: 18, unit: 4, unitTitle: "Jobs & Daily Life", title: "Time Expressions",
    vocab: [
      { word: "Leero",    meaning: "Today",        example: "Leero Bbalaza. (Today is Monday.)" },
      { word: "Jjo",      meaning: "Yesterday",    example: "Jjo twasoma. (Yesterday we studied.)" },
      { word: "Enkola",   meaning: "Tomorrow",     example: "Enkola njja. (Tomorrow I will come.)" },
      { word: "Kaakano",  meaning: "Now / Currently", example: "Kaakano nsoma. (I am studying now.)" },
      { word: "Edda",     meaning: "Before / Long ago", example: "Edda bwali butuufu. (Long ago it was true.)" },
    ],
    grammar: {
      point:       "Future Tense with '-nda-'",
      explanation: "To form the future tense, insert '-nda-' between the subject prefix and verb stem. 'Njja' (I come/go) → 'Nnaajja' (I will come). Or simply use 'Enkola' (tomorrow) with present tense.",
      example:     "Enkola njja eka. (Tomorrow I will go home.) | Nnaakola. (I will work.)",
    },
    exercises: [
      {
        question: "What does 'Leero' mean?",
        options:  ["Yesterday", "Tomorrow", "Today", "Now"],
        answer:   "Today",
      },
      {
        question: "How do you say 'yesterday'?",
        options:  ["Leero", "Kaakano", "Jjo", "Enkola"],
        answer:   "Jjo",
      },
    ],
  },

  {
    id: 19, unit: 4, unitTitle: "Jobs & Daily Life", title: "Action Verbs",
    vocab: [
      { word: "Okukola",  meaning: "To work / to do",  example: "Njagala okukola leero. (I want to work today.)" },
      { word: "Okusoma",  meaning: "To study / to read", example: "Nsoma Luganda. (I study Luganda.)" },
      { word: "Okuteeka", meaning: "To put / to place",  example: "Teeka empapula ku meza. (Put the papers on the table.)" },
      { word: "Okugenda", meaning: "To go",              example: "Njagala okugenda ku katale. (I want to go to the market.)" },
      { word: "Okujja",   meaning: "To come",            example: "Jja wano! (Come here!)" },
    ],
    grammar: {
      point:       "Infinitive form: 'Oku-' prefix",
      explanation: "Luganda verbs in infinitive (to-form) use the prefix 'Oku-'. 'Oku-kola' = to work, 'Oku-soma' = to study, 'Oku-genda' = to go. Used after words like 'Njagala' (I want).",
      example:     "Njagala okukola. (I want to work.) | Sisobola okujja. (I cannot come.)",
    },
    exercises: [
      {
        question: "What does 'Okugenda' mean?",
        options:  ["To come", "To work", "To go", "To study"],
        answer:   "To go",
      },
      {
        question: "'Njagala okusoma' means:",
        options:  ["I want to work", "I want to study", "I want to eat", "I want to go"],
        answer:   "I want to study",
      },
    ],
  },

  {
    id: 20, unit: 4, unitTitle: "Jobs & Daily Life", title: "Describing People",
    vocab: [
      { word: "Omuwanguzi", meaning: "Tall person",   example: "Omuwanguzi nnyo. (Very tall.)" },
      { word: "Muto",       meaning: "Young",          example: "Mwana muto. (A young child.)" },
      { word: "Mukulu",     meaning: "Big / Old / Elder", example: "Jjajja mukulu. (The elder/old grandparent.)" },
      { word: "Mugenyi",    meaning: "Visitor / Guest",   example: "Mugenyi ajja leero. (A guest is coming today.)" },
      { word: "Mwongera",   meaning: "Smart / Clever",    example: "Omusomi mwongera. (The student is smart.)" },
    ],
    grammar: {
      point:       "Adjective Position in Luganda",
      explanation: "In Luganda, most adjectives come AFTER the noun (unlike English). 'Omwana muto' = young child (child young). 'Ennyumba ennene' = big house (house big).",
      example:     "Omwana muto = young child | Omusomi mwongera = clever student | Jjajja mukulu = old grandparent",
    },
    exercises: [
      {
        question: "What does 'Muto' mean?",
        options:  ["Old", "Big", "Young", "Tall"],
        answer:   "Young",
      },
      {
        question: "In Luganda, where do adjectives usually go?",
        options:  ["Before the noun", "After the noun", "At the start of the sentence", "At the end of the sentence"],
        answer:   "After the noun",
      },
    ],
  },

  // ── Unit 5: Mu Kibuga (In Town) ───────────────────────────────────────────

  {
    id: 21, unit: 5, unitTitle: "In Town", title: "Places in Town",
    vocab: [
      { word: "Ddwaliro",  meaning: "Hospital",    example: "Nenda ku ddwaliro. (I go to the hospital.)" },
      { word: "Ssomero",   meaning: "School",      example: "Abaana bali ku ssomero. (Children are at school.)" },
      { word: "Ekkanisa",  meaning: "Church",      example: "Tugende ku ekkanisa. (Let's go to church.)" },
      { word: "Kibuga",    meaning: "Town / City", example: "Kampala kya kibuga. (Kampala is a city.)" },
      { word: "Omutengo",  meaning: "Road / Street", example: "Genda ku omutengo omukulu. (Go to the main road.)" },
    ],
    grammar: {
      point:       "'Ku' (at/on/to) and 'Mu' (in/inside)",
      explanation: "'Ku' is used for locations at/on a surface or at a place: 'ku ssomero' (at school). 'Mu' is used for locations inside something: 'mu ennyumba' (inside the house), 'mu kibuga' (in town).",
      example:     "Ndi ku ssomero. (I am at school.) | Ndi mu ennyumba. (I am inside the house.)",
    },
    exercises: [
      {
        question: "What does 'Ddwaliro' mean?",
        options:  ["School", "Church", "Market", "Hospital"],
        answer:   "Hospital",
      },
      {
        question: "Which preposition means 'inside'?",
        options:  ["Ku", "Mu", "Na", "Ko"],
        answer:   "Mu",
      },
    ],
  },

  {
    id: 22, unit: 5, unitTitle: "In Town", title: "Asking Directions",
    vocab: [
      { word: "Omuzira wa?",  meaning: "Where is the road to...?", example: "Omuzira wa Kampala? (Where is the way to Kampala?)" },
      { word: "Ddako",        meaning: "Turn left",                example: "Ddako ku ntambiro. (Turn left at the junction.)" },
      { word: "Ddayo",        meaning: "Turn right",               example: "Ddayo ku nsonda. (Turn right at the corner.)" },
      { word: "Genda butereevu", meaning: "Go straight",          example: "Genda butereevu, okutuuka ku ssomero. (Go straight, until you reach the school.)" },
      { word: "Wano",         meaning: "Here",                     example: "Wano kiri kino. (Here it is.)" },
    ],
    grammar: {
      point:       "'Okutuuka' (to reach/arrive)",
      explanation: "'Okutuuka' means 'to arrive/reach a destination'. 'Ntuuka' = I arrive. To say 'until you reach': 'okutuuka ku...' Used when giving directions.",
      example:     "Genda butereevu okutuuka ku katale. (Go straight until you reach the market.)",
    },
    exercises: [
      {
        question: "What does 'Genda butereevu' mean?",
        options:  ["Turn left", "Go straight", "Turn right", "Stop here"],
        answer:   "Go straight",
      },
      {
        question: "'Ddako' means:",
        options:  ["Turn right", "Go forward", "Turn left", "Go back"],
        answer:   "Turn left",
      },
    ],
  },

  {
    id: 23, unit: 5, unitTitle: "In Town", title: "Transport",
    vocab: [
      { word: "Taakisi",   meaning: "Taxi / Minibus",        example: "Nkubye taakisi. (I took a taxi.)" },
      { word: "Boda boda", meaning: "Motorcycle taxi",       example: "Njagala boda boda. (I want a boda boda.)" },
      { word: "Embalaasi", meaning: "Bus / Car",             example: "Embalaasi ejja amasooka. (The bus comes first/early.)" },
      { word: "Nkwata",    meaning: "I take / I catch",      example: "Nkwata taakisi Kampala. (I take a taxi to Kampala.)" },
      { word: "Ekitundu",  meaning: "Stage / Stop (transport)", example: "Ekitundu kiri wano. (The stage is here.)" },
    ],
    grammar: {
      point:       "Getting Transport: Useful phrases",
      explanation: "To get a ride: 'Mpita ku [place]?' (Do you pass by [place]?). To ask the fare: 'Falaani yaffe?' (What's our fare?). To get off: 'Naggala wano' (I'm getting off here).",
      example:     "Mpita ku Nakawa? (Do you pass by Nakawa?) | Naggala wano! (Stop here! / I'm getting off here!)",
    },
    exercises: [
      {
        question: "What is a 'Boda boda'?",
        options:  ["Minibus taxi", "Train", "Motorcycle taxi", "Bicycle"],
        answer:   "Motorcycle taxi",
      },
      {
        question: "How do you say 'Stop here' when getting off a taxi?",
        options:  ["Mpita wano", "Naggala wano", "Tuuka wano", "Ddako wano"],
        answer:   "Naggala wano",
      },
    ],
  },

  {
    id: 24, unit: 5, unitTitle: "In Town", title: "Shopping",
    vocab: [
      { word: "Dduuka",    meaning: "Shop / Store",       example: "Nenda ku dduuka. (I go to the shop.)" },
      { word: "Nsuubira",  meaning: "I need / I want",   example: "Nsuubira sukali. (I need sugar.)" },
      { word: "Omuwendo",  meaning: "Price",              example: "Omuwendo gwa kkumi. (Price is ten thousand.)" },
      { word: "Bbeera",    meaning: "Change (money)",     example: "Mpe bbeera yange. (Give me my change.)" },
      { word: "Amaka",     meaning: "Family (brand/type)", example: "Amaka ga bbaasi. (The brand of the bus.)" },
    ],
    grammar: {
      point:       "Bargaining phrases",
      explanation: "Key shopping phrases: 'Yambaza' (bargain/negotiate), 'Kakasa' (confirm/finalize), 'Tono wa!' (too expensive!), 'Waggula emuwendo' (reduce the price).",
      example:     "Waggula omuwendo. (Reduce the price.) | Kizza ne maama ssente? (How much altogether?)",
    },
    exercises: [
      {
        question: "What does 'Dduuka' mean?",
        options:  ["Market", "Bank", "Shop/Store", "School"],
        answer:   "Shop/Store",
      },
      {
        question: "How do you ask for change?",
        options:  ["Mpita bbeera", "Mpita ssente", "Mpe bbeera yange", "Nkula bbeera"],
        answer:   "Mpe bbeera yange",
      },
    ],
  },

  {
    id: 25, unit: 5, unitTitle: "In Town", title: "Money & Prices",
    vocab: [
      { word: "Ssente",       meaning: "Money",          example: "Ndi na ssente ntono. (I have little money.)" },
      { word: "Emitwalo",     meaning: "Thousand (shillings)", example: "Emitwalo kkumi = 10,000 UGX." },
      { word: "Emisirikiti",  meaning: "Hundred (shillings)", example: "Emisirikiti ttaano = 500 UGX." },
      { word: "Entegyereza",  meaning: "Receipt",        example: "Mpe entegyereza. (Give me a receipt.)" },
      { word: "Banka",        meaning: "Bank",            example: "Nenda ku banka. (I go to the bank.)" },
    ],
    grammar: {
      point:       "Expressing Large Numbers",
      explanation: "For prices in UGX: 1,000 = 'emitwalo emu'. 5,000 = 'emitwalo ttaano'. 10,000 = 'emitwalo kkumi'. For hundreds: 100 = 'emisirikiti emu'. 500 = 'emisirikiti ttaano'.",
      example:     "Kizza emitwalo bbiri. (It costs 2,000 shillings.) | Emisirikiti munaana. (Eight hundred shillings.)",
    },
    exercises: [
      {
        question: "What does 'Ssente' mean?",
        options:  ["Change", "Money", "Price", "Receipt"],
        answer:   "Money",
      },
      {
        question: "'Emitwalo kkumi' equals:",
        options:  ["1,000 UGX", "5,000 UGX", "10,000 UGX", "100,000 UGX"],
        answer:   "10,000 UGX",
      },
    ],
  },

  // ── Unit 6: Obulamu (Health & Celebrations) ───────────────────────────────

  {
    id: 26, unit: 6, unitTitle: "Health & Celebrations", title: "Health & Body",
    vocab: [
      { word: "Ndi mulwadde",  meaning: "I am sick",       example: "Ndi mulwadde leero. (I am sick today.)" },
      { word: "Obwongo",       meaning: "Head",             example: "Obwongo bwange bubuma. (My head aches.)" },
      { word: "Ekizimba",      meaning: "Stomach",          example: "Ekizimba kyange kibiina. (My stomach hurts.)" },
      { word: "Ndi mabega",    meaning: "I have back pain", example: "Ndi mabega. (I have back pain.)" },
      { word: "Ddawa",         meaning: "Medicine",         example: "Nsuubira ddawa. (I need medicine.)" },
    ],
    grammar: {
      point:       "Describing Pain",
      explanation: "To say a body part hurts: '[body part] [verb for pain]'. 'Kubuma' = to ache/hurt. 'Obwongo bwange bubuma' (my head aches). 'Kibiina' = it pains me. For general sickness: 'Ndi mulwadde'.",
      example:     "Obwongo bwange bubuma. (My head aches.) | Ekizimba kyange kibiina. (My stomach is paining.)",
    },
    exercises: [
      {
        question: "How do you say 'I am sick'?",
        options:  ["Ndi ndi malamu", "Ndi mulwadde", "Ndi na enzala", "Ndi na enyonta"],
        answer:   "Ndi mulwadde",
      },
      {
        question: "What does 'Ddawa' mean?",
        options:  ["Doctor", "Hospital", "Medicine", "Nurse"],
        answer:   "Medicine",
      },
    ],
  },

  {
    id: 27, unit: 6, unitTitle: "Health & Celebrations", title: "Weather",
    vocab: [
      { word: "Mutindo",   meaning: "Cold / Cool weather",  example: "Obudde bwa mutindo leero. (The weather is cold today.)" },
      { word: "Omusana",   meaning: "Sunshine / Hot",       example: "Omusana ogukaaba. (The sun is very hot.)" },
      { word: "Enkuba",    meaning: "Rain",                  example: "Enkuba etonnya. (It is raining.)" },
      { word: "Eggulu",    meaning: "Sky",                   example: "Eggulu lya bbululu. (The sky is blue.)" },
      { word: "Empewo",    meaning: "Wind",                  example: "Empewo enkambwe. (Strong wind.)" },
    ],
    grammar: {
      point:       "Describing Weather with 'Obudde' (Weather/Time)",
      explanation: "'Obudde' means both 'weather' and 'time'. 'Obudde bwa mutindo' = cold weather. 'Obudde bwa omusana' = hot/sunny weather. 'Enkuba etonnya' = it is raining (lit. rain is falling).",
      example:     "Obudde bwa mutindo leero. (The weather is cold today.) | Enkuba etonnya. (It is raining.)",
    },
    exercises: [
      {
        question: "What does 'Enkuba etonnya' mean?",
        options:  ["It is windy", "It is sunny", "It is raining", "It is cold"],
        answer:   "It is raining",
      },
      {
        question: "What does 'Omusana' mean?",
        options:  ["Rain", "Wind", "Cloud", "Sunshine/Hot"],
        answer:   "Sunshine/Hot",
      },
    ],
  },

  {
    id: 28, unit: 6, unitTitle: "Health & Celebrations", title: "Animals",
    vocab: [
      { word: "Ente",     meaning: "Cow",     example: "Ente ya taata wange. (My father's cow.)" },
      { word: "Endiga",   meaning: "Goat",    example: "Endiga bbiri mu luggya. (Two goats in the yard.)" },
      { word: "Enjovu",   meaning: "Elephant",example: "Enjovu ennene nnyo. (The elephant is very big.)" },
      { word: "Empisi",   meaning: "Hyena",   example: "Empisi egenda usiku. (The hyena goes at night.)" },
      { word: "Nkima",    meaning: "Monkey",  example: "Nkima eryookya mu muti. (The monkey jumps in the tree.)" },
    ],
    grammar: {
      point:       "Animal noun classes",
      explanation: "Animals in Luganda have their own noun class. Many start with 'En-' (endiga, enjovu, empisi). Verbs and adjectives agree: 'Enjovu ennene' (big elephant), 'Endiga entono' (small goat). Plural: 'Injovu' (elephants), 'Endiga' stays for goats.",
      example:     "Enjovu ennene = big elephant | Endiga bbiri = two goats | Nkima omuto = a small monkey",
    },
    exercises: [
      {
        question: "What does 'Enjovu' mean?",
        options:  ["Lion", "Elephant", "Monkey", "Crocodile"],
        answer:   "Elephant",
      },
      {
        question: "What does 'Endiga' mean?",
        options:  ["Cow", "Sheep", "Goat", "Pig"],
        answer:   "Goat",
      },
    ],
  },

  {
    id: 29, unit: 6, unitTitle: "Health & Celebrations", title: "Celebrations",
    vocab: [
      { word: "Embaga",      meaning: "Celebration / Party / Wedding feast", example: "Embaga ya Maria. (Maria's wedding feast.)" },
      { word: "Oluzaaliwa",  meaning: "Birthday",                example: "Oluzaaliwa lwo olwa mukwano. (Your birthday is good.)" },
      { word: "Omwaka",      meaning: "Year",                    example: "Omwaka gumu = one year." },
      { word: "Nyumirwa!",   meaning: "Congratulations!",        example: "Nyumirwa ku oluzaaliwa lwo! (Congratulations on your birthday!)" },
      { word: "Agafaayo",    meaning: "Best wishes / It's important", example: "Agafaayo, Ssebo. (Best wishes, Sir.)" },
    ],
    grammar: {
      point:       "Wishing someone well",
      explanation: "Key celebration phrases: 'Nyumirwa!' (Congratulations!), 'Webale nnyo!' (Thank you very much!), 'Ekisa kya Katonda!' (God's grace!). For Happy Birthday: 'Nyumirwa ku oluzaaliwa lwo!'.",
      example:     "Nyumirwa ku oluzaaliwa lwo! (Happy Birthday!) | Embaga ya Uganda enkosa! (Uganda's celebrations are good!)",
    },
    exercises: [
      {
        question: "What does 'Oluzaaliwa' mean?",
        options:  ["Wedding", "Funeral", "Birthday", "Party"],
        answer:   "Birthday",
      },
      {
        question: "How do you say 'Congratulations!'?",
        options:  ["Weebale!", "Nyumirwa!", "Kale!", "Yego!"],
        answer:   "Nyumirwa!",
      },
    ],
  },

  {
    id: 30, unit: 6, unitTitle: "Health & Celebrations", title: "Putting It All Together",
    vocab: [
      { word: "Mzungu",       meaning: "Foreigner / White person",  example: "Mzungu asoma Luganda! (The foreigner studies Luganda!)" },
      { word: "OmwUganda",    meaning: "Ugandan person",            example: "OmwUganda akolaako. (A Ugandan person works hard.)" },
      { word: "Abantu",       meaning: "People",                    example: "Abantu bali ku katale. (People are at the market.)" },
      { word: "Obuntu",       meaning: "Humanity / Kindness",       example: "Obuntu bwa Uganda. (The humanity/kindness of Uganda.)" },
      { word: "Webale kufunza!", meaning: "Thank you for learning!", example: "Webale kufunza Luganda! (Thank you for learning Luganda!)" },
    ],
    grammar: {
      point:       "Review: The Journey of Language Learning",
      explanation: "You've completed the A1 Luganda curriculum! You can now greet people, introduce yourself, talk about food, navigate town, describe your daily life, and participate in conversations. Keep practicing with GandaBot's Chat and Pronunciation features!",
      example:     "Oli otya? — Ndi bulungi, webale! Erinnya lyange nze [your name]. Njagala Luganda! (How are you? — I'm fine, thank you! My name is [your name]. I love Luganda!)",
    },
    exercises: [
      {
        question: "What does 'Obuntu' mean?",
        options:  ["Ugandan food", "Humanity/Kindness", "A greeting", "The country Uganda"],
        answer:   "Humanity/Kindness",
      },
      {
        question: "You've completed 30 lessons! How do you say 'Thank you for learning'?",
        options:  ["Webale kufunza!", "Weebale nnyo!", "Nyumirwa!", "Tutuuse!"],
        answer:   "Webale kufunza!",
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** All lessons for a given unit (1-indexed) */
export function getLessonsForUnit(unit: number): Lesson[] {
  return LESSONS.filter((l) => l.unit === unit);
}

/** All distinct units with their titles */
export interface UnitMeta { unit: number; title: string; }
export const UNITS: UnitMeta[] = Array.from(
  new Map(LESSONS.map((l) => [l.unit, { unit: l.unit, title: l.unitTitle }])).values(),
);

/** Whether a lesson is unlocked given a set of completed lesson IDs */
export function isLessonUnlocked(lesson: Lesson, completedIds: Set<number>): boolean {
  if (lesson.id === 1) return true;               // always start with lesson 1
  return completedIds.has(lesson.id - 1);          // sequential gate
}

/** Progress percentage (0–100) */
export function curriculumProgress(completedIds: Set<number>): number {
  return Math.round((completedIds.size / LESSONS.length) * 100);
}
