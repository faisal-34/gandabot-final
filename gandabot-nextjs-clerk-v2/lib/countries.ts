/**
 * Curated static data for 16 African countries shown in the Explorer module.
 * All facts are accurate as of 2024–2025 (populations approximate).
 *
 * Phrases are given in the dominant local/indigenous language for each country.
 */

export interface Phrase {
  phrase:  string; // original language text
  meaning: string; // English translation
}

export interface CountryData {
  name:       string;
  flag:       string;
  capital:    string;
  currency:   string;
  population: string;
  language:   string;   // primary/official languages summary
  tagline:    string;   // short evocative label, e.g. "Pearl of Africa"
  overview:   string;
  culture:    string;
  phrases:    Phrase[]; // local language phrases
  phraseLang: string;   // language the phrases are in
  foods:      string[];
  landmarks:  string[];
  funFact:    string;
}

// ─── Country data ─────────────────────────────────────────────────────────────

const COUNTRIES_LIST: CountryData[] = [
  {
    name:       "Uganda",
    flag:       "🇺🇬",
    capital:    "Kampala",
    currency:   "Ugandan Shilling (UGX)",
    population: "~48 million",
    language:   "English (official), Luganda, Swahili, + 40 indigenous languages",
    tagline:    "Pearl of Africa",
    overview:
      "Uganda, nestled in the heart of East Africa, is a landlocked nation of extraordinary biodiversity and deep cultural heritage. Home to the world's last large population of mountain gorillas, the source of the Nile at Jinja, and the vast waters of Lake Victoria — Africa's largest lake — Uganda punches far above its size. Over 65 ethnic groups, anchored by the ancient Buganda Kingdom, give the country a social fabric of remarkable richness and variety.",
    culture:
      "Ugandan culture is built on the principle of obuntu — the understanding that a person is shaped by their community. The Buganda Kingdom, based in Kampala, has preserved centuries-old traditions: the Kabaka (king), royal drums (engoma), amadinda xylophones, and the UNESCO-listed Kasubi Tombs where past Kabakas are buried. The Kadodi dance marks important life milestones. Rolex — a chapati rolled with egg and vegetables — was invented on Kampala's streets and became a national icon.",
    phraseLang: "Luganda",
    phrases: [
      { phrase: "Oli otya?",           meaning: "How are you?" },
      { phrase: "Bulungi",             meaning: "I'm fine / Well" },
      { phrase: "Webale nyo",          meaning: "Thank you very much" },
      { phrase: "Gyebale ko",          meaning: "Well done (to someone working)" },
      { phrase: "Nsanyuse okukulaba",  meaning: "Nice to meet you" },
      { phrase: "Ale",                 meaning: "Okay / Alright" },
      { phrase: "Tukutendereza",       meaning: "We praise you (common greeting song)" },
    ],
    foods:     ["Matoke (steamed green banana)", "Rolex (chapati egg wrap)", "Posho (maize porridge)", "Groundnut stew (ebinyebwa)", "Nsenene (fried grasshoppers)", "Matooke with g-nut sauce"],
    landmarks: ["Bwindi Impenetrable Forest (gorilla trekking)", "Murchison Falls National Park", "Lake Victoria (Africa's largest lake)", "Kasubi Tombs (UNESCO)", "Sipi Falls, Kapchorwa", "Rwenzori Mountains (Mountains of the Moon)"],
    funFact:   "Uganda is one of only three countries in the world where mountain gorillas still live in the wild — and it hosts more than half of the entire global population.",
  },

  {
    name:       "Kenya",
    flag:       "🇰🇪",
    capital:    "Nairobi",
    currency:   "Kenyan Shilling (KES)",
    population: "~56 million",
    language:   "English & Swahili (both official), + 60 ethnic languages",
    tagline:    "Cradle of the Safari",
    overview:
      "Kenya straddles the equator on Africa's eastern coast, where the Great Rift Valley cuts through dramatic landscapes stretching from snow-capped Mount Kenya to the golden savannahs of the Maasai Mara. Africa's fourth-largest economy, Kenya is the commercial hub of East Africa, famed for world-class long-distance runners, Nairobi's Silicon Savannah tech scene, and the original meaning of 'safari' — a Swahili word for journey.",
    culture:
      "Kenya's 44 officially recognized ethnic groups include the Maasai, Kikuyu, Luo, Luhya, and Kalenjin. Maasai warriors in signature red shukas with intricate beadwork are one of Africa's most recognised cultural images. Kenya is the birthplace of Benga music and has a thriving contemporary arts and film scene. The Lamu Old Town — East Africa's oldest and best-preserved Swahili settlement — is a UNESCO World Heritage Site.",
    phraseLang: "Swahili",
    phrases: [
      { phrase: "Habari yako?",  meaning: "How are you?" },
      { phrase: "Nzuri sana",    meaning: "Very well" },
      { phrase: "Asante sana",   meaning: "Thank you very much" },
      { phrase: "Karibu",        meaning: "Welcome / You're welcome" },
      { phrase: "Pole pole",     meaning: "Slowly / Take it easy" },
      { phrase: "Hakuna matata", meaning: "No worries" },
      { phrase: "Twende",        meaning: "Let's go" },
    ],
    foods:     ["Ugali (maize porridge)", "Nyama choma (grilled meat)", "Sukuma wiki (collard greens)", "Mandazi (fried dough)", "Pilau (spiced rice)", "Mutura (Kenyan sausage)"],
    landmarks: ["Maasai Mara National Reserve", "Mount Kenya (UNESCO)", "Lamu Old Town (UNESCO)", "Amboseli National Park", "Lake Turkana (UNESCO)", "Diani Beach"],
    funFact:   "Kenya has produced more Olympic and World Championship long-distance running medals than any other nation — the Kalenjin people of the Rift Valley are home to a disproportionate number of the world's greatest runners.",
  },

  {
    name:       "Tanzania",
    flag:       "🇹🇿",
    capital:    "Dodoma (official) / Dar es Salaam (largest city)",
    currency:   "Tanzanian Shilling (TZS)",
    population: "~65 million",
    language:   "Swahili & English (both official)",
    tagline:    "Land of Kilimanjaro & the Serengeti",
    overview:
      "Tanzania harbours some of Africa's greatest natural wonders within a single border: the roof of Africa (Mount Kilimanjaro, 5,895 m), the world's largest animal migration (1.5 million wildebeest in the Serengeti), the world's largest intact volcanic caldera (Ngorongoro), and Zanzibar's spice islands — a crossroads of Arab, Persian, Indian, and Portuguese maritime trade for over a millennium.",
    culture:
      "Tanzania's 120+ ethnic groups share a remarkable common identity through the Swahili language and ujamaa — the philosophy of collective African socialism promoted by founding president Julius Nyerere. Zanzibar's Taarab music blends Arabic lute, Indian harmonium, and African percussion into hypnotic compositions. Stone Town, Zanzibar — a UNESCO World Heritage Site — preserves centuries of Swahili mercantile architecture in carved wooden doors and coral stone buildings.",
    phraseLang: "Swahili",
    phrases: [
      { phrase: "Mambo vipi?",   meaning: "What's up? (youth greeting)" },
      { phrase: "Poa",           meaning: "Cool (response to mambo)" },
      { phrase: "Shikamoo",      meaning: "Respectful greeting to elders" },
      { phrase: "Marahaba",      meaning: "Elder's response to Shikamoo" },
      { phrase: "Kwa heri",      meaning: "Goodbye" },
      { phrase: "Rafiki",        meaning: "Friend" },
      { phrase: "Asante",        meaning: "Thank you" },
    ],
    foods:     ["Zanzibar pizza (stuffed flatbread)", "Pilau (spiced rice)", "Ugali", "Mishkaki (grilled kebabs)", "Urojo (Zanzibar mix soup)", "Wali na nyama (rice and meat)"],
    landmarks: ["Mount Kilimanjaro (UNESCO)", "Serengeti National Park (UNESCO)", "Ngorongoro Crater (UNESCO)", "Stone Town Zanzibar (UNESCO)", "Selous Game Reserve (UNESCO)", "Olduvai Gorge (cradle of humankind)"],
    funFact:   "Olduvai Gorge in Tanzania is where anthropologist Louis Leakey discovered some of the earliest human fossils — making Tanzania a literal birthplace of humankind.",
  },

  {
    name:       "Rwanda",
    flag:       "🇷🇼",
    capital:    "Kigali",
    currency:   "Rwandan Franc (RWF)",
    population: "~14 million",
    language:   "Kinyarwanda, English, French (all official), Swahili",
    tagline:    "Land of a Thousand Hills",
    overview:
      "Rwanda's story is one of the most remarkable in modern history. Thirty years after the 1994 genocide in which nearly one million people were killed in 100 days, Rwanda stands as one of Africa's cleanest, safest, and fastest-growing economies. Kigali is consistently rated Africa's cleanest city. Rwanda has the world's highest proportion of women in parliament and has become a continental model for reconciliation, governance, and environmental conservation.",
    culture:
      "Rwanda's culture predates colonialism and is embedded in the Kinyarwanda language, shared by nearly all Rwandans regardless of ethnicity. Imigongo — geometric art made from cow dung and clay, painted in earth tones — is unique to Rwanda. Intore warrior dances and the umuganura harvest festival celebrate resilience and community. Monthly Umuganda community workdays unite neighbourhoods in voluntary service. Volcanoes National Park's mountain gorillas, immortalised by Dian Fossey, draw visitors from around the world.",
    phraseLang: "Kinyarwanda",
    phrases: [
      { phrase: "Muraho",    meaning: "Hello" },
      { phrase: "Amakuru?",  meaning: "How are you?" },
      { phrase: "Ni meza",   meaning: "I'm fine" },
      { phrase: "Murakoze",  meaning: "Thank you" },
      { phrase: "Yego",      meaning: "Yes" },
      { phrase: "Oya",       meaning: "No" },
      { phrase: "Mwiriwe",   meaning: "Good evening" },
    ],
    foods:     ["Ugali", "Isombe (cassava leaves with eggplant)", "Mizuzu (fried plantains)", "Brochettes (grilled skewers)", "Ikivuguto (fermented milk)", "Akabenz (grilled pork ribs)"],
    landmarks: ["Volcanoes National Park (mountain gorillas)", "Nyungwe Forest National Park", "Lake Kivu", "Kigali Genocide Memorial", "Inema Arts Center", "Ethnographic Museum, Huye"],
    funFact:   "Rwanda has the world's highest proportion of women in a national parliament — over 60% of seats are held by women, surpassing every other country on Earth.",
  },

  {
    name:       "Ethiopia",
    flag:       "🇪🇹",
    capital:    "Addis Ababa",
    currency:   "Ethiopian Birr (ETB)",
    population: "~127 million",
    language:   "Amharic (official), Oromo, Tigrinya, Somali, + 80 languages",
    tagline:    "Cradle of Civilization & Coffee",
    overview:
      "Ethiopia is Africa's oldest independent nation — never colonised (except briefly by Italy, 1936–41). It is the birthplace of coffee, the origin of Homo sapiens sapiens, home to the Rock-Hewn Churches of Lalibela (carved entirely from living rock in the 12th century), and guardian of one of Christianity's oldest traditions. Ethiopia has its own script (Ethiopic/Ge'ez), its own calendar (13 months, 7–8 years behind the Gregorian calendar), and its own time system.",
    culture:
      "Ethiopian culture revolves around the coffee ceremony — an elaborate ritual of roasting, grinding, and brewing beans that can last hours, representing hospitality and community. The Ethiopian Orthodox Christian church, established in 330 AD, is one of the world's oldest Christian institutions. Injera — a vast sourdough flatbread — serves as both plate and utensil at communal meals. The Aksumite Empire's ancient obelisks still stand in Aksum. Ethiopia follows the Julian calendar, meaning the country celebrated the new millennium in 2007.",
    phraseLang: "Amharic",
    phrases: [
      { phrase: "Selam",            meaning: "Hello / Peace" },
      { phrase: "Dehna neh/next?",  meaning: "Are you well? (m/f)" },
      { phrase: "Ishi",             meaning: "Okay / Alright" },
      { phrase: "Ameseginalehu",    meaning: "Thank you" },
      { phrase: "Yiqirta",          meaning: "Sorry / Excuse me" },
      { phrase: "Betam",            meaning: "Very / Very much" },
      { phrase: "Inset new?",       meaning: "What is this?" },
    ],
    foods:     ["Injera with various wats (stews)", "Doro wat (spiced chicken stew)", "Kitfo (Ethiopian beef tartare)", "Tibs (sautéed meat)", "Ayib (Ethiopian cottage cheese)", "Ethiopian coffee ceremony"],
    landmarks: ["Lalibela Rock Churches (UNESCO)", "Aksum Obelisks (UNESCO)", "Simien Mountains (UNESCO)", "Blue Nile Falls", "Danakil Depression (hottest place on Earth)", "Lucy fossil site, Hadar"],
    funFact:   "Ethiopia is the origin of coffee — the legend of Kaldi, a 9th-century goatherd who noticed his goats dancing after eating berries from a certain tree, describes the world's first recorded discovery of the coffee plant.",
  },

  {
    name:       "Ghana",
    flag:       "🇬🇭",
    capital:    "Accra",
    currency:   "Ghanaian Cedi (GHS)",
    population: "~34 million",
    language:   "English (official), Twi, Ewe, Dagbani, Ga, + 70 languages",
    tagline:    "Gateway to Africa",
    overview:
      "Ghana was the first sub-Saharan African country to gain independence from colonial rule — on 6 March 1957, under Kwame Nkrumah — sparking independence movements across the continent. Known as one of Africa's most stable democracies, Ghana is a regional anchor for West Africa. It holds deep historical weight as a central hub of the transatlantic slave trade, a legacy acknowledged and confronted through the 'Year of Return' movement in 2019.",
    culture:
      "Ghanaian culture is globally recognised for Kente cloth — hand-woven in bold geometric patterns with deep symbolic meaning, originally reserved for Ashanti royalty and now worn at celebrations worldwide. Highlife music, born in Ghana in the 1920s, blends traditional drumming with colonial brass bands. Ghanaian funerals are celebrated as elaborate multi-day festivals honouring life. The Ashanti Kingdom's golden stool (Sika Dwa Kofi) is one of the world's most sacred royal symbols.",
    phraseLang: "Twi",
    phrases: [
      { phrase: "Maakye",        meaning: "Good morning" },
      { phrase: "Wo ho te sɛn?", meaning: "How are you?" },
      { phrase: "Me ho yɛ",      meaning: "I'm fine" },
      { phrase: "Meda wo ase",   meaning: "Thank you" },
      { phrase: "Yoo",           meaning: "Okay" },
      { phrase: "Akwaaba",       meaning: "Welcome" },
      { phrase: "Ɛyɛ",           meaning: "It's good / Alright" },
    ],
    foods:     ["Jollof rice (the original, Ghana insists)", "Fufu with light soup", "Waakye (rice and beans)", "Kelewele (spiced fried plantain)", "Banku with tilapia", "Kontomire stew"],
    landmarks: ["Cape Coast Castle (UNESCO)", "Elmina Castle (UNESCO)", "Kakum National Park (canopy walkway)", "Mole National Park", "Lake Volta (world's largest artificial lake by area)", "Larabanga Mosque (oldest mosque in West Africa)"],
    funFact:   "Ghana's Lake Volta, created by the Akosombo Dam in 1965, is the world's largest artificial lake by surface area — covering 8,502 km², larger than Lebanon.",
  },

  {
    name:       "Nigeria",
    flag:       "🇳🇬",
    capital:    "Abuja (official) / Lagos (economic hub)",
    currency:   "Nigerian Naira (NGN)",
    population: "~225 million",
    language:   "English (official), Hausa, Yoruba, Igbo, + 500 languages",
    tagline:    "Giant of Africa",
    overview:
      "Nigeria is Africa's most populous nation and largest economy — and one of the world's most culturally prolific countries. With over 500 ethnic groups and languages, it produces more films annually than Hollywood (Nollywood is the world's second-largest film industry by output). Afrobeats — pioneered by Fela Kuti and globalised by Burna Boy, Wizkid, and Davido — is now one of the world's dominant popular music genres.",
    culture:
      "Nigeria's three dominant cultural clusters — Yoruba, Hausa-Fulani, and Igbo — each preserve elaborate traditions. The Yoruba egungun masquerade, the Igbo New Yam Festival (Iriji), and the Durbar horse cavalry festivals in the north are celebrated with enormous pageantry. Nigeria is home to Nobel laureate Wole Soyinka and a canon of world literature including Chinua Achebe's Things Fall Apart — the most widely read African novel ever written.",
    phraseLang: "Yoruba",
    phrases: [
      { phrase: "Bawo ni?",     meaning: "How are you?" },
      { phrase: "Mo wa daadaa", meaning: "I'm fine" },
      { phrase: "E se",         meaning: "Thank you (informal)" },
      { phrase: "E joor",       meaning: "Please" },
      { phrase: "Beeni",        meaning: "Yes" },
      { phrase: "Rara",         meaning: "No / Not at all" },
      { phrase: "Odabo",        meaning: "Goodbye" },
    ],
    foods:     ["Jollof rice (Nigeria's claim is equally fierce)", "Pounded yam with egusi soup", "Suya (spiced grilled skewers)", "Akara (bean cakes)", "Moi moi (steamed bean pudding)", "Boli (roasted plantain)"],
    landmarks: ["Olumo Rock, Abeokuta", "Yankari National Park", "Osun-Osogbo Sacred Grove (UNESCO)", "Sukur Cultural Landscape (UNESCO)", "Zuma Rock, Abuja", "Nike Art Gallery, Lagos"],
    funFact:   "Nigeria's film industry — Nollywood — produces over 2,500 films per year, making it the world's second-largest film industry by volume, behind only India's Bollywood and ahead of Hollywood.",
  },

  {
    name:       "South Africa",
    flag:       "🇿🇦",
    capital:    "Pretoria / Cape Town / Bloemfontein",
    currency:   "South African Rand (ZAR)",
    population: "~62 million",
    language:   "11 official languages: Zulu, Xhosa, Afrikaans, English, + 7 more",
    tagline:    "Rainbow Nation",
    overview:
      "South Africa occupies the continent's southern tip where the Atlantic and Indian Oceans meet — a meeting point that shaped centuries of global maritime trade. The site of Nelson Mandela's 27-year imprisonment on Robben Island and the dismantling of apartheid in 1994, South Africa is a living testament to extraordinary political transformation. It is the continent's most industrialised economy and one of the world's most biodiverse countries.",
    culture:
      "Ubuntu — 'I am because we are' — is the philosophical foundation of South African social life. The country's 11 official languages reflect a diversity that includes Zulu stick fighting and beadwork, Xhosa ululation and initiation ceremonies (umkhwetha), Afrikaner boerewors and braai culture, and the Cape Malay culinary tradition brought by enslaved Southeast Asians. Johannesburg's Soweto township is the birthplace of South African jazz and the emotional heartland of the anti-apartheid struggle.",
    phraseLang: "Zulu",
    phrases: [
      { phrase: "Sawubona",      meaning: "Hello (lit. 'I see you')" },
      { phrase: "Unjani?",       meaning: "How are you?" },
      { phrase: "Ngiyaphila",    meaning: "I am well" },
      { phrase: "Ngiyabonga",    meaning: "Thank you" },
      { phrase: "Yebo",          meaning: "Yes" },
      { phrase: "Hamba kahle",   meaning: "Go well (goodbye to traveller)" },
      { phrase: "Sala kahle",    meaning: "Stay well (goodbye to one staying)" },
    ],
    foods:     ["Braai (South African BBQ — a national institution)", "Biltong (air-dried cured meat)", "Bunny chow (curry in hollowed bread)", "Bobotie (Cape Malay spiced mince)", "Boerewors (farmer's sausage)", "Malva pudding"],
    landmarks: ["Table Mountain (UNESCO)", "Robben Island (UNESCO)", "Kruger National Park", "Cape of Good Hope", "Drakensberg Mountains (UNESCO)", "iSimangaliso Wetland Park (UNESCO)"],
    funFact:   "South Africa has three capital cities: Pretoria (executive), Cape Town (legislative), and Bloemfontein (judicial) — the only country in the world with three co-equal national capitals.",
  },

  {
    name:       "Egypt",
    flag:       "🇪🇬",
    capital:    "Cairo",
    currency:   "Egyptian Pound (EGP)",
    population: "~106 million",
    language:   "Arabic (official); Egyptian Arabic spoken; English & French widely understood",
    tagline:    "Gift of the Nile",
    overview:
      "Egypt is the cradle of one of humanity's oldest and most enduring civilisations, with a recorded history spanning 5,000 years. Home to the last surviving wonder of the ancient world — the Great Pyramid of Giza — Egypt sits at the crossroads of Africa, the Arab world, and the Mediterranean. The Nile River, the world's longest, has sustained Egyptian life since the Pharaohs, and today sustains 95% of Egyptians who live along its banks.",
    culture:
      "Egyptian culture layers 5,000 years of Pharaonic tradition with millennia of Islamic and Coptic Christian heritage. Al-Azhar University in Cairo, founded in 970 AD, is one of the world's oldest continuously operating universities. Egyptian cinema and music dominated Arab culture throughout the 20th century. The call to prayer echoes from over 1,000 minarets across Cairo five times a day. Ramadan transforms cities into nocturnal celebrations of food, family, and faith.",
    phraseLang: "Egyptian Arabic",
    phrases: [
      { phrase: "Ahlan",           meaning: "Hello / Welcome" },
      { phrase: "Izzayak/Izzayik", meaning: "How are you? (m/f)" },
      { phrase: "Kwayyes",         meaning: "Fine / Good" },
      { phrase: "Shukran",         meaning: "Thank you" },
      { phrase: "Afwan",           meaning: "You're welcome" },
      { phrase: "Yalla",           meaning: "Let's go / Come on" },
      { phrase: "Inshallah",       meaning: "God willing / Hopefully" },
    ],
    foods:     ["Ful medames (fava bean stew)", "Koshari (rice, lentils, pasta, tomato sauce)", "Ta'meya (Egyptian falafel)", "Molokhia (green leaf soup)", "Hawawshi (spiced meat in bread)", "Umm Ali (Egyptian bread pudding)"],
    landmarks: ["Great Pyramid of Giza & Sphinx (UNESCO)", "Luxor Temple & Karnak (UNESCO)", "Valley of the Kings (UNESCO)", "Abu Simbel (UNESCO)", "White Desert National Park", "Siwa Oasis"],
    funFact:   "The Great Pyramid of Giza was the tallest man-made structure in the world for 3,800 years — from 2560 BC until the Lincoln Cathedral was completed in England in 1311 AD.",
  },

  {
    name:       "Morocco",
    flag:       "🇲🇦",
    capital:    "Rabat",
    currency:   "Moroccan Dirham (MAD)",
    population: "~38 million",
    language:   "Arabic & Tamazight/Berber (official), Darija (Moroccan Arabic spoken), French widely used",
    tagline:    "Where the Desert Meets the Sea",
    overview:
      "Morocco is Africa's gateway to Europe — and one of the world's most layered cultural destinations. Berber, Arab, Andalusian, sub-Saharan, French, and Spanish influences have woven together over millennia to produce a civilisation of extraordinary culinary, architectural, and artistic depth. Morocco's ancient medinas (walled cities) are living UNESCO labyrinths of commerce, craft, and devotion preserved across centuries.",
    culture:
      "Moroccan culture is defined by the ritual of hospitality: mint tea poured from height into small glasses is both greeting and gift. The medersas (Islamic schools), hammams (communal steam baths), and souks (markets) are the infrastructure of daily social life. Gnawa music — brought to Morocco by enslaved sub-Saharan Africans — is a UNESCO-listed tradition of trance healing and spiritual ceremony. The University of al-Qarawiyyin in Fez, founded in 859 AD, is considered the world's oldest continuously operating degree-granting university.",
    phraseLang: "Moroccan Darija",
    phrases: [
      { phrase: "Salam",          meaning: "Hello / Peace" },
      { phrase: "Labas?",         meaning: "How are you? / Everything okay?" },
      { phrase: "La bas, hamdullah", meaning: "Fine, praise God" },
      { phrase: "Shukran bzaf",   meaning: "Thank you very much" },
      { phrase: "Bslama",         meaning: "Goodbye" },
      { phrase: "Mzyan",          meaning: "Good / Nice" },
      { phrase: "Wakha",          meaning: "Okay / Agreed" },
    ],
    foods:     ["Tagine (slow-cooked clay pot stew)", "Couscous (national dish, Friday tradition)", "Harira (hearty tomato soup)", "Bastilla (flaky pigeon/chicken pie)", "Msemen (layered flatbread)", "Mint tea with chebakia pastries"],
    landmarks: ["Fez Medina (UNESCO)", "Djemaa el-Fna, Marrakech (UNESCO)", "Aït Benhaddou (UNESCO)", "Sahara Desert dunes at Merzouga", "Hassan II Mosque, Casablanca", "Chefchaouen (the Blue City)"],
    funFact:   "The University of al-Qarawiyyin in Fez, founded in 859 AD by Fatima al-Fihri — a woman — is recognised by UNESCO and the Guinness World Records as the world's oldest continuously operating university.",
  },

  {
    name:       "Senegal",
    flag:       "🇸🇳",
    capital:    "Dakar",
    currency:   "West African CFA Franc (XOF)",
    population: "~18 million",
    language:   "French (official), Wolof (national lingua franca), Pulaar, Serer, + 30 languages",
    tagline:    "Land of Teranga",
    overview:
      "Senegal, at Africa's westernmost point, is one of the continent's most stable democracies — it has never experienced a military coup, a rare achievement in West Africa. Dakar is the region's most vibrant creative capital, producing world-class musicians, filmmakers, and visual artists. Teranga — a Wolof word for hospitality that has no precise English equivalent — is considered a foundational national virtue and shapes every interaction with strangers.",
    culture:
      "Wolof cultural norms dominate Senegalese social life: greetings are elaborate and multi-layered, detailed inquiries about family and health are mandatory. Sabar drumming and Mbalax music — electrifying rhythms popularised globally by Youssou N'Dour — are at the heart of Senegalese identity. The Mouride Islamic brotherhood, headquartered in the sacred city of Touba, is one of West Africa's most powerful religious, cultural, and economic forces. Gorée Island, a short ferry ride from Dakar, was one of the main departure points for enslaved Africans across the Atlantic.",
    phraseLang: "Wolof",
    phrases: [
      { phrase: "Nanga def",        meaning: "How are you?" },
      { phrase: "Maa ngi fi rekk",  meaning: "I'm here / I'm fine" },
      { phrase: "Jërejëf",          meaning: "Thank you" },
      { phrase: "Waaw",             meaning: "Yes" },
      { phrase: "Déedéet",          meaning: "No" },
      { phrase: "Mangi dem",        meaning: "I'm going / Goodbye" },
      { phrase: "Ba beneen",        meaning: "See you next time" },
    ],
    foods:     ["Thiéboudienne (fish and rice — national dish)", "Yassa poulet (lemon-marinated chicken)", "Mafé (peanut butter stew)", "Thiakry (sweet millet dessert)", "Bissap (hibiscus flower juice)", "Café Touba (spiced coffee)"],
    landmarks: ["Gorée Island (UNESCO)", "Pink Lake (Lac Rose, Retba)", "Bassari Country (UNESCO)", "Dakar African Renaissance Monument", "Djoudj National Bird Sanctuary (UNESCO)", "Casamance forest region"],
    funFact:   "Senegal's national wrestling tradition — Laamb — is the country's most popular sport, rivalling football. Top wrestlers are national celebrities, and championship bouts fill stadiums with tens of thousands of fans.",
  },

  {
    name:       "Zimbabwe",
    flag:       "🇿🇼",
    capital:    "Harare",
    currency:   "Zimbabwe Gold / ZiG (USD widely used)",
    population: "~16 million",
    language:   "16 official languages: English, Shona, Ndebele, + 13 more",
    tagline:    "Land of the Great Zimbabwe",
    overview:
      "Zimbabwe is home to one of the ancient world's greatest architectural achievements: Great Zimbabwe — a vast ruined stone city built without mortar between the 11th and 15th centuries, the capital of a powerful Shona kingdom that controlled gold and ivory trade across Southern Africa. Victoria Falls — locally called Mosi-oa-Tunya, 'The Smoke That Thunders' — is one of the Seven Natural Wonders of the World. Despite decades of economic turbulence, Zimbabweans are renowned for resilience, warmth, and one of Africa's highest literacy rates.",
    culture:
      "Shona culture is deeply connected to the mbira (thumb piano) — a resonant instrument over 1,000 years old used in spirit possession ceremonies to communicate with ancestors. Shona stone sculpture has gained international recognition as one of Africa's most distinctive contemporary art forms. Ndebele beadwork creates bold geometric patterns of remarkable complexity. The jit rhythm, Zimbabwe's most recognisable dance music tradition, influenced Afropop across the continent.",
    phraseLang: "Shona",
    phrases: [
      { phrase: "Mhoro",              meaning: "Hello" },
      { phrase: "Makadii?",           meaning: "How are you?" },
      { phrase: "Ndiripo",            meaning: "I am here / I'm fine" },
      { phrase: "Maita basa",         meaning: "Thank you (well done)" },
      { phrase: "Hongu",              meaning: "Yes" },
      { phrase: "Aiwa",               meaning: "No" },
      { phrase: "Fambai zvakanaka",   meaning: "Go well (goodbye)" },
    ],
    foods:     ["Sadza (maize porridge — the national staple)", "Nyama (grilled meat)", "Muriwo unedovi (greens with peanut butter)", "Mopane worms (protein-rich delicacy)", "Maheu (fermented grain drink)", "Bota (thin porridge)"],
    landmarks: ["Victoria Falls / Mosi-oa-Tunya (UNESCO)", "Great Zimbabwe Ruins (UNESCO)", "Hwange National Park", "Matobo Hills (UNESCO)", "Gonarezhou National Park", "Chimanimani Mountains"],
    funFact:   "Victoria Falls is the world's largest waterfall by combined width and height — the curtain of water is 1,708 metres wide and 108 metres tall, and the spray can be seen from 50 kilometres away.",
  },

  {
    name:       "Cameroon",
    flag:       "🇨🇲",
    capital:    "Yaoundé (political) / Douala (economic)",
    currency:   "Central African CFA Franc (XAF)",
    population: "~29 million",
    language:   "French & English (both official), Fulfulde, Ewondo, Bamileke, + 280 languages",
    tagline:    "Africa in Miniature",
    overview:
      "Cameroon earns its nickname 'Africa in Miniature' because within its borders lie dense rainforests, open savannahs, semi-arid Sahel, volcanic highlands, Atlantic beaches, and over 280 languages — an entire continent's worth of diversity compressed into a single country. It is a major biodiversity hotspot, home to forest elephants, western lowland gorillas, chimpanzees, and the drill monkey found nowhere else on Earth.",
    culture:
      "Cameroon's extraordinary cultural diversity ranges from the sultanates and lamidats of the Muslim north to the elaborate Bamileke chieftaincy systems and the forest-dwelling Baka hunter-gatherers. Traditional rulers — fons and lamidos — hold genuine political, judicial, and spiritual authority in their communities. Cameroonian music spans Makossa (soulful urban), Bikutsi (fast-paced Beti rhythm), and Ndombolo — all danced throughout Central and West Africa. The national football team, the Indomitable Lions, is Africa's most iconic.",
    phraseLang: "Cameroonian Pidgin",
    phrases: [
      { phrase: "How you dey?",  meaning: "How are you?" },
      { phrase: "I dey fine",    meaning: "I'm fine" },
      { phrase: "Na so",         meaning: "That's right / Exactly" },
      { phrase: "No be lie",     meaning: "It's true / For real" },
      { phrase: "Weti?",         meaning: "What?" },
      { phrase: "Make we go",    meaning: "Let's go" },
      { phrase: "Bonne chance",  meaning: "Good luck" },
    ],
    foods:     ["Ndolé (bitter leaf stew with peanuts — national dish)", "Eru (forest plant stew)", "Mbongo tchobi (black pepper stew)", "Fufu (cassava or plantain)", "Soya (Cameroonian suya)", "Kondre (plantain and goat stew)"],
    landmarks: ["Mount Cameroon (active volcano, highest in West/Central Africa)", "Waza National Park", "Dja Faunal Reserve (UNESCO)", "Limbe Wildlife Centre", "Foumban Royal Palace", "Kribi beaches and Lobe Falls"],
    funFact:   "Cameroon has the highest linguistic density in Africa — with over 280 indigenous languages spoken across a population of 29 million, it averages roughly one distinct language per 100,000 people.",
  },

  {
    name:       "Ivory Coast",
    flag:       "🇨🇮",
    capital:    "Yamoussoukro (official) / Abidjan (largest city)",
    currency:   "West African CFA Franc (XOF)",
    population: "~28 million",
    language:   "French (official), Dioula (trade lingua franca), Baoulé, Bété, + 60 languages",
    tagline:    "Cocoa Capital of the World",
    overview:
      "Côte d'Ivoire is West Africa's economic powerhouse and the world's single largest producer of cocoa beans, responsible for approximately 40% of global supply — meaning that nearly every bar of chocolate you have ever eaten owes something to this country. Despite periods of political crisis, it has emerged as one of Africa's fastest-growing economies. Abidjan is West Africa's most dynamic business and cultural hub.",
    culture:
      "Baoulé and Bété masquerade traditions feature hand-carved wooden masks of extraordinary spiritual power, used only in sacred ceremonies by initiated mask societies. The Akan peoples share goldsmithing traditions with Ghana's Ashanti, creating elaborate jewellery and regalia. Zouglou music — a satirical, commentary-driven urban genre — and coupé-décalé — an energetic Abidjan club style — have spread from Ivorian streets to dance floors across Africa and the diaspora.",
    phraseLang: "Dioula",
    phrases: [
      { phrase: "I ni ce",      meaning: "Good day / Hello" },
      { phrase: "A ni wula",    meaning: "Good evening" },
      { phrase: "An sɔrɔ?",    meaning: "How are you?" },
      { phrase: "N sɔrɔ nɔgɔ", meaning: "I'm fine" },
      { phrase: "I ni baara",   meaning: "Thank you for your work" },
      { phrase: "Ŋɔn",          meaning: "Yes" },
      { phrase: "Nba",          meaning: "No" },
    ],
    foods:     ["Attiéké (fermented cassava couscous — national staple)", "Foutou (pounded yam or plantain)", "Kedjenou (slow-cooked chicken in sealed pot)", "Alloco (fried plantain with chilli)", "Poisson braisé (grilled fish)", "Garba (tuna with attiéké)"],
    landmarks: ["Taï National Park (UNESCO)", "Comoé National Park (UNESCO)", "Basilica of Our Lady of Peace, Yamoussoukro (largest church in the world)", "Grand-Bassam Colonial Town (UNESCO)", "Abidjan Plateau district", "Mont Nimba Strict Nature Reserve (UNESCO)"],
    funFact:   "The Basilica of Our Lady of Peace in Yamoussoukro, completed in 1989, is the largest church in the world by area — larger even than St Peter's Basilica in Rome, though it took a personal letter from Pope John Paul II to get it consecrated.",
  },

  {
    name:       "Mozambique",
    flag:       "🇲🇿",
    capital:    "Maputo",
    currency:   "Mozambican Metical (MZN)",
    population: "~34 million",
    language:   "Portuguese (official), Makhuwa, Sena, Ndau, Changana, + 40 languages",
    tagline:    "Pearl of the Indian Ocean",
    overview:
      "Mozambique stretches along Africa's southeastern coast for 2,470 km of Indian Ocean shoreline — one of the world's longest coastlines — sheltering pristine coral reefs, deserted archipelagos, and extraordinary marine biodiversity. Emerging from a devastating civil war that ended in 1992, Mozambique has rebuilt itself through eco-tourism and giant natural gas discoveries. Its Portuguese colonial history wove a unique cultural hybrid of Bantu, Arab, Indian, and Lusophone influences unlike anywhere else in Africa.",
    culture:
      "Mozambican culture sits at a cultural crossroads. Timbila music — performed by the Chopi people on wooden xylophone orchestras of up to 40 players — is a UNESCO-listed intangible heritage of extraordinary complexity. Marrabenta music, lively and once politically coded, is the national popular music form. The capulana — a bold, colourful wrap cloth — is central to Mozambican women's identity and worn daily. Traditional healers (curandeiros) remain widely consulted across the country.",
    phraseLang: "Portuguese",
    phrases: [
      { phrase: "Olá",                  meaning: "Hello" },
      { phrase: "Como está?",           meaning: "How are you?" },
      { phrase: "Estou bem, obrigado/a", meaning: "I'm well, thank you (m/f)" },
      { phrase: "Por favor",            meaning: "Please" },
      { phrase: "Com licença",          meaning: "Excuse me" },
      { phrase: "Até logo",             meaning: "See you soon (goodbye)" },
      { phrase: "Sim / Não",            meaning: "Yes / No" },
    ],
    foods:     ["Piri-piri prawns (Mozambique's culinary gift to the world)", "Matapa (cassava leaves with peanuts and coconut milk)", "Xima (maize porridge)", "Caril de caranguejo (crab curry)", "Chamussas (Mozambican samosas)", "Bolo polana (cashew and potato cake)"],
    landmarks: ["Quirimbas Archipelago National Park", "Gorongosa National Park", "Ilha de Moçambique (UNESCO)", "Bazaruto Archipelago", "Maputo Special Reserve (home to elephants and hippos)", "Pemba Bay"],
    funFact:   "Mozambique's flag is the only national flag in the world to feature a modern firearm — an AK-47 with a bayonet — representing the country's armed struggle for independence from Portugal, which ended in 1975.",
  },

  {
    name:       "Madagascar",
    flag:       "🇲🇬",
    capital:    "Antananarivo",
    currency:   "Malagasy Ariary (MGA)",
    population: "~30 million",
    language:   "Malagasy & French (both official)",
    tagline:    "The Eighth Continent",
    overview:
      "Madagascar is the world's fourth-largest island and one of Earth's most unique biodiversity hotspots — it broke away from the African mainland 88 million years ago, allowing over 90% of its wildlife to evolve in complete isolation. More than 100 lemur species are found nowhere else on Earth. The Malagasy people are a remarkable blend of Austronesian settlers (who arrived from Borneo around 2,000 years ago by outrigger canoe) and Bantu African migrants — reflected in a language closer to Malay than to any African tongue.",
    culture:
      "Famadihana — 'the Turning of the Bones' — is Madagascar's most distinctive cultural tradition: every few years, families exhume the remains of ancestors, rewrap them in fresh silk shrouds, and dance with them to music while sharing stories, honouring the dead as continuing members of the living family. Fihavanana — solidarity, kinship, and mutual obligation — is the central Malagasy social value. The island's 18 ethnic clans (foko) each maintain distinct customs, music, and cattle-herding traditions.",
    phraseLang: "Malagasy",
    phrases: [
      { phrase: "Manao ahoana", meaning: "Hello / How are you?" },
      { phrase: "Salama",       meaning: "Hi (informal)" },
      { phrase: "Misaotra",     meaning: "Thank you" },
      { phrase: "Azafady",      meaning: "Please / Excuse me" },
      { phrase: "Eny",          meaning: "Yes" },
      { phrase: "Tsia",         meaning: "No" },
      { phrase: "Veloma",       meaning: "Goodbye" },
    ],
    foods:     ["Romazava (zebu beef and greens stew — national dish)", "Ravitoto (pork with cassava leaves)", "Rice (Malagasy are among the world's highest per-capita rice consumers)", "Koba (steamed rice and peanut cake wrapped in banana leaf)", "Ranonapango (rice water drink)", "Akoho sy voanio (chicken with coconut)"],
    landmarks: ["Avenue of the Baobabs, Morondava", "Tsingy de Bemaraha (UNESCO)", "Rainforests of Atsinanana (UNESCO)", "Isalo National Park", "Nosy Be island", "Royal Hill of Ambohimanga (UNESCO)"],
    funFact:   "The ancestors of all Malagasy people sailed to Madagascar from Borneo (modern Indonesia) roughly 2,000 years ago in outrigger canoes — a sea voyage of over 7,000 km across the open Indian Ocean, one of the greatest pre-modern human migrations ever made.",
  },
];

// ─── Lookup map ───────────────────────────────────────────────────────────────

export const COUNTRIES: Record<string, CountryData> = Object.fromEntries(
  COUNTRIES_LIST.map((c) => [c.name, c]),
);

export const COUNTRY_NAMES = COUNTRIES_LIST.map((c) => c.name);

/**
 * Case-insensitive lookup. Returns null if not found.
 */
export function getCountry(name: string): CountryData | null {
  const key = Object.keys(COUNTRIES).find(
    (k) => k.toLowerCase() === name.trim().toLowerCase(),
  );
  return key ? COUNTRIES[key] : null;
}
