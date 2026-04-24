import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
})

// South African name database for ethnicity and gender detection
const saNameDatabase = {
  // Zulu names
  zulu: {
    male: ["sipho", "thabo", "sibusiso", "bongani", "mandla", "siyabonga", "mthobisi", "nhlanhla", "thulani", "sandile", "senzo", "mbongeni", "bheki", "musa", "jabulani", "lucky", "sbusiso", "sifiso", "mondli", "vusi", "themba", "mpumelelo", "nkosinathi", "sakhile", "thokozani", "zweli", "mfundo", "ayanda", "lungelo", "sphesihle", "bonginkosi", "sihle", "njabulo", "mlungisi", "thabiso", "zenzele", "dumisani", "lindani", "xolani", "mxolisi"],
    female: ["nomvula", "zanele", "nonhlanhla", "nomzamo", "nompumelelo", "thandi", "zinhle", "nomfundo", "nothando", "nomalanga", "nonkululeko", "ntombi", "nobuhle", "nolwazi", "nokuthula", "noxolo", "nosipho", "nomvelo", "nombuso", "nokukhanya", "nomusa", "buhle", "enhle", "minenhle", "owami", "amahle", "ayabonga", "lwandle", "sne", "snethemba"]
  },
  // Xhosa names
  xhosa: {
    male: ["andile", "anele", "asanda", "athenkosi", "aviwe", "ayabulela", "bandile", "bulelani", "chumani", "fundiswa", "khanyisa", "lindile", "litha", "lizo", "lubabalo", "lukhanyo", "lunga", "lungile", "luxolo", "malusi", "masixole", "mawethu", "mcebisi", "mfanafuthi", "mluleki", "mncedisi", "mnqobi", "monde", "monwabisi", "mvuyo", "nceba", "ndumiso", "nkosikhona", "odwa", "olwethu", "onke", "sakhiwo", "sicelo", "simphiwe", "sisa", "sive", "siyamthanda", "sonwabo", "tanduxolo", "thembinkosi", "thembelani", "thembile", "unathi", "viwe", "vuyani", "vuyisile", "wandile", "xola", "xolile", "yamkela", "yanga", "yonela", "zama", "zamile", "zingisa", "zithulele", "zolani", "zolile", "zuko", "zukile", "zwelakhe", "zwelihle"],
    female: ["anathi", "akhona", "amyoli", "asiphe", "asithandile", "athini", "aviwe", "babalwa", "busisiwe", "cwenga", "esona", "fundiswa", "khanyisile", "lelethu", "lilitha", "linamandla", "lisakhanya", "litha", "lulama", "lumka", "lungiswa", "lusanda", "mandisa", "masina", "mihlali", "ncumisa", "nolitha", "noloyiso", "noluthando", "noluvuyo", "nolwandle", "nomakhosi", "nomathemba", "nombuyiselo", "nomonde", "nomtha", "nosisa", "nosizwe", "novuyo", "phindile", "sihle", "simthandile", "sinalo", "siphosethu", "sisanda", "siyasanga", "thandeka", "thandiwe", "thandolwethu", "thobeka", "unathi", "viwe", "vuyelwa", "xoliswa", "yamkela", "yolanda", "yoliswa", "zimasa", "zintle", "ziyanda", "zoleka"]
  },
  // Sotho/Tswana/Pedi names
  sotho: {
    male: ["thabo", "tshepo", "kabelo", "kagiso", "katlego", "lebogang", "lerato", "lesego", "letlotlo", "modise", "motheo", "mpho", "neo", "omphile", "phenyo", "rapelang", "refiloe", "reitumetse", "resego", "seipati", "thabang", "thabiso", "thato", "tlotlo", "tsebo", "tshegofatso", "tshepiso", "tumelo", "tumisang", "boipelo", "boitumelo", "karabo", "keabetswe", "kefilwe", "kelebogile", "kemang", "kemorena", "keneilwe", "keorapetse", "ketso", "koketso", "kutlwano", "lehlohonolo", "lekau", "lereko", "leruo", "letshego", "lorato", "malebogo", "masego", "matlhogonolo", "moagi", "moatlhodi", "modiri", "mogapi", "moitheri", "mojaki", "mokete", "mokoena", "molefe", "molemo", "morapedi", "morena", "mosimanegape", "motlalepula", "motsamai", "naledi", "oarabile", "oatile", "obakeng", "ofentse", "olebogeng", "olorato", "omolemo", "onalenna", "onkarabile", "onthatile", "ontiretse", "ookeditse", "oratile", "oratilwe", "otsile", "otlile"],
    female: ["dineo", "kelebogile", "keitumetse", "lerato", "lesedi", "masego", "mpho", "neo", "palesa", "refilwe", "tebogo", "thato", "tsholofelo", "puleng", "boitumelo", "dikeledi", "gaopalelwe", "goitseone", "gorata", "gosiame", "kealeboga", "keamogetswe", "keaobaka", "kedisaletse", "keitumetse", "kelebogile", "kemelo", "kenalemang", "keneuwe", "kenosi", "keratilwe", "kesaobaka", "ketshepile", "kgalalelo", "kgaogelo", "kgomotso", "koketso", "kutlwano", "lebogang", "lefentse", "lekau", "lentle", "lerapo", "leruo", "lesedi", "letshego", "lorato", "malebogo", "mapula", "marang", "masechaba", "masego", "matshidiso", "matlhogonolo", "mmapula", "mmasetshaba", "modiegi", "mogakolodi", "moipone", "mojaki", "mokgadi", "molebogeng", "molemo", "moratwa", "morwadi", "mosadi", "motlalepula", "motshedisi", "mpho", "naledi", "neo", "nkgopotse", "nkosinathi", "ntsiki", "oarabile", "obonye", "ofentse", "olebogeng", "olorato", "omphile", "onalerona", "onalethata", "one", "onthatile", "ontlametse", "oratile", "oratilwe", "otsile", "palesa", "phenyo", "pono", "pulane", "puleng", "reabetswe", "realeboga", "rebaone", "rebatho", "remofilwe", "reneilwe", "resego", "tebatso", "tebogo", "thato", "thatoyaone", "thebeetsile", "thero", "thobo", "tiroyaone", "tlhalefo", "tlotlo", "tshepo", "tshiamo", "tshwanelo", "tumelo", "tumo"]
  },
  // Afrikaans names (typically White or Coloured)
  afrikaans: {
    male: ["andries", "barend", "charl", "danie", "deon", "dirk", "fanie", "francois", "gert", "gerhard", "hansie", "heinrich", "hennie", "herman", "jacques", "jan", "jaco", "johan", "johannes", "kobus", "koos", "marius", "nico", "nicolaas", "piet", "pieter", "pierre", "riaan", "ruan", "schalk", "stefan", "stephan", "theuns", "thinus", "wessel", "willem", "wikus", "wynand", "adriaan", "albertus", "anton", "arnoldus", "barnie", "bennie", "bertus", "braam", "burger", "callie", "casper", "christo", "cobus", "coenraad", "cornel", "cornelius", "coenie", "dawid", "dewald", "dries", "eddie", "elardus", "erasmus", "ernst", "eugene", "fanus", "ferdi", "flip", "fourie", "francois", "frik", "fritz", "gideon", "gielie", "gys", "hannes", "hardus", "hein", "hendrik", "henk", "hentie", "hercules", "izak", "jakes", "jannie", "janus", "japie", "jasper", "jj", "jordaan", "josias", "jurgen", "klasie", "kosie", "lourens", "louis", "louwrens", "lukas", "martin", "matthys", "melt", "naas", "neels", "ockert", "otto", "paul", "petrus", "philippus", "polla", "retief", "robbie", "rocco", "roelof", "sakkie", "sarel", "schalk", "stefaans", "stef", "stoffel", "sybrand", "tienie", "theunis", "tjaart", "tjakie", "tobie", "toit", "tonie", "waldo", "werda", "wian", "wimpie", "wouter"],
    female: ["anita", "anna", "annette", "antoinette", "bettie", "carike", "chantelle", "charlene", "christa", "corlia", "cornelia", "dalene", "elna", "elsabe", "elsa", "elize", "esme", "francina", "gerda", "gretha", "grietjie", "hanlie", "hester", "ilse", "ina", "irma", "jacoba", "jana", "janine", "jeanette", "juanita", "karien", "karlien", "katrien", "lida", "liezl", "lina", "lindie", "louisa", "magda", "mara", "marelize", "margaretha", "maria", "mariana", "marie", "marietjie", "marlene", "marthie", "martie", "melanie", "minette", "miemie", "monika", "nanette", "nellie", "petro", "petra", "ria", "riana", "rienie", "ronel", "ronelle", "sanette", "sarie", "sonja", "suna", "sunet", "sunette", "suzaan", "suzette", "tannie", "tersia", "tilla", "tina", "trix", "trudie", "wilma", "yolanda", "zelda"]
  },
  // Indian South African names
  indian: {
    male: ["anil", "ashwin", "deepak", "dilip", "dinesh", "ganesh", "gopal", "govind", "hari", "jayesh", "kiran", "krishna", "kumar", "mahesh", "manoj", "mohan", "mukesh", "naren", "naresh", "naveen", "nikhil", "pavan", "pradeep", "prakash", "pravin", "rahul", "raj", "rajen", "rajesh", "rakesh", "ramesh", "ravi", "rohit", "sachin", "sandeep", "sanjay", "satish", "shailesh", "shiv", "sunil", "suresh", "vijay", "vinay", "vinod", "vishal", "vivek", "yash", "yogesh"],
    female: ["anita", "asha", "deepa", "devika", "gita", "indira", "jaya", "kavitha", "lakshmi", "lalita", "lata", "meena", "neelam", "neha", "nisha", "padma", "parvathi", "pooja", "priya", "radha", "rashmi", "rekha", "rina", "rita", "roshni", "sandhya", "sarita", "savita", "shakuntala", "shanti", "sheila", "shobha", "sita", "sudha", "suma", "sunita", "sushma", "swati", "usha", "vasantha", "vidya", "vijaya"]
  },
  // Common Indian SA surnames
  indianSurnames: ["naidoo", "pillay", "naicker", "govender", "chetty", "moodley", "reddy", "maharaj", "singh", "patel", "padayachee", "perumal", "murugan", "nair", "krishna", "ramjee", "ramsamy", "naidu", "subramoney", "pillay", "govender", "chetty", "moodley", "reddy", "maharaj", "singh", "patel"],
  // Common Afrikaans/White SA surnames
  afrikaansSurnames: ["van der merwe", "botha", "joubert", "pretorius", "van zyl", "van niekerk", "du plessis", "meyer", "steyn", "van wyk", "fourie", "venter", "coetzee", "de villiers", "kruger", "barnard", "erasmus", "swanepoel", "cilliers", "potgieter", "brits", "du toit", "marais", "van rensburg", "jansen", "smit", "smith", "williams", "jacobs", "de beer", "lombard", "bester", "schoeman", "olivier", "muller", "grobler", "theron", "wolmarans", "wessels", "human", "vermaak", "loubser", "jordaan", "swart", "roux"],
  // Common Coloured SA surnames (often shared with Afrikaans)
  colouredSurnames: ["adams", "alexander", "andrews", "april", "benjamin", "booysen", "carolus", "daniels", "davids", "de bruyn", "february", "fredericks", "hendricks", "isaacs", "jacobs", "jansen", "johnson", "josephs", "julius", "louw", "maart", "manuel", "matthews", "minnaar", "moses", "petersen", "philander", "pietersen", "salie", "september", "slabbert", "smith", "solomons", "williams", "witbooi"]
}

// Analyze South African name to detect ethnicity and gender
function analyzeNameForEthnicityAndGender(fullName: string | null | undefined): { ethnicity: string | null, gender: string | null } {
  if (!fullName) return { ethnicity: null, gender: null }
  
  const nameParts = fullName.toLowerCase().trim().split(/\s+/)
  const firstName = nameParts[0] || ""
  const lastName = nameParts[nameParts.length - 1] || ""
  
  let detectedEthnicity: string | null = null
  let detectedGender: string | null = null
  
  // Check surnames first for ethnicity hints
  if (saNameDatabase.indianSurnames.includes(lastName)) {
    detectedEthnicity = "Indian South African"
  } else if (saNameDatabase.afrikaansSurnames.includes(lastName)) {
    detectedEthnicity = "White South African" // Could also be Coloured
  } else if (saNameDatabase.colouredSurnames.includes(lastName)) {
    detectedEthnicity = "Coloured South African"
  }
  
  // Check first names for both ethnicity and gender
  // Zulu names
  if (saNameDatabase.zulu.male.includes(firstName)) {
    detectedEthnicity = detectedEthnicity || "Black African (Zulu)"
    detectedGender = "male"
  } else if (saNameDatabase.zulu.female.includes(firstName)) {
    detectedEthnicity = detectedEthnicity || "Black African (Zulu)"
    detectedGender = "female"
  }
  // Xhosa names
  else if (saNameDatabase.xhosa.male.includes(firstName)) {
    detectedEthnicity = detectedEthnicity || "Black African (Xhosa)"
    detectedGender = "male"
  } else if (saNameDatabase.xhosa.female.includes(firstName)) {
    detectedEthnicity = detectedEthnicity || "Black African (Xhosa)"
    detectedGender = "female"
  }
  // Sotho/Tswana/Pedi names
  else if (saNameDatabase.sotho.male.includes(firstName)) {
    detectedEthnicity = detectedEthnicity || "Black African (Sotho/Tswana)"
    detectedGender = "male"
  } else if (saNameDatabase.sotho.female.includes(firstName)) {
    detectedEthnicity = detectedEthnicity || "Black African (Sotho/Tswana)"
    detectedGender = "female"
  }
  // Afrikaans names
  else if (saNameDatabase.afrikaans.male.includes(firstName)) {
    detectedEthnicity = detectedEthnicity || "White South African"
    detectedGender = "male"
  } else if (saNameDatabase.afrikaans.female.includes(firstName)) {
    detectedEthnicity = detectedEthnicity || "White South African"
    detectedGender = "female"
  }
  // Indian names
  else if (saNameDatabase.indian.male.includes(firstName)) {
    detectedEthnicity = detectedEthnicity || "Indian South African"
    detectedGender = "male"
  } else if (saNameDatabase.indian.female.includes(firstName)) {
    detectedEthnicity = detectedEthnicity || "Indian South African"
    detectedGender = "female"
  }
  
  return { ethnicity: detectedEthnicity, gender: detectedGender }
}

// Map ethnicity to visual description for accurate representation
function getEthnicityDescription(ethnicity: string | null | undefined, nameBasedEthnicity: string | null): string {
  // Priority: explicit setting > name-based detection
  if (ethnicity) {
    const ethnicityMap: Record<string, string> = {
      "black-african": "Black African",
      "coloured": "Coloured South African (mixed heritage)",
      "indian": "Indian South African",
      "white": "White South African",
      "asian": "Asian",
      "other": "South African",
    }
    return ethnicityMap[ethnicity] || "South African"
  }
  
  // Use name-based detection as fallback
  if (nameBasedEthnicity) {
    return nameBasedEthnicity
  }
  
  return "South African"
}

// Map gender to visual description
function getGenderDescription(gender: string | null | undefined, nameBasedGender: string | null): string {
  // Priority: explicit setting > name-based detection
  if (gender) {
    const genderMap: Record<string, string> = {
      "male": "man",
      "female": "woman",
      "non-binary": "person",
      "other": "person",
    }
    return genderMap[gender] || "person"
  }
  
  // Use name-based detection as fallback
  if (nameBasedGender) {
    return nameBasedGender === "male" ? "man" : "woman"
  }
  
  return "person"
}

// Comprehensive story analysis for accurate image generation
function analyzeStory(content: string, title: string, category: string): {
  scenes: string[]
  characters: string[]
  emotions: string[]
  actions: string[]
  settings: string[]
  objects: string[]
  timeOfDay: string
  weather: string
} {
  const text = (content + " " + title).toLowerCase()
  
  const scenes: string[] = []
  const characters: string[] = []
  const emotions: string[] = []
  const actions: string[] = []
  const settings: string[] = []
  const objects: string[] = []
  let timeOfDay = "golden hour sunset"
  let weather = "clear sky"

  // Detect specific scenes and actions from the story
  if (text.includes("crying") || text.includes("tears")) {
    actions.push("wiping tears")
    emotions.push("emotional")
  }
  if (text.includes("hugging") || text.includes("embrace") || text.includes("held me")) {
    actions.push("embracing")
    emotions.push("tender")
  }
  if (text.includes("running") || text.includes("ran away") || text.includes("escape")) {
    actions.push("running")
    emotions.push("desperate")
  }
  if (text.includes("walking") || text.includes("walked")) {
    actions.push("walking on a path")
  }
  if (text.includes("sitting") || text.includes("sat down")) {
    actions.push("sitting contemplatively")
  }
  if (text.includes("praying") || text.includes("prayer") || text.includes("church")) {
    actions.push("praying")
    settings.push("church or spiritual setting")
  }
  if (text.includes("working") || text.includes("job") || text.includes("office")) {
    actions.push("working")
    settings.push("workplace")
  }
  if (text.includes("cooking") || text.includes("kitchen")) {
    actions.push("cooking")
    settings.push("kitchen")
  }
  if (text.includes("studying") || text.includes("books") || text.includes("exam")) {
    actions.push("studying")
    objects.push("books")
  }

  // Detect characters mentioned
  if (text.includes("my father") || text.includes("my dad") || text.includes("daddy") || text.includes("tata")) {
    characters.push("father figure")
  }
  if (text.includes("my mother") || text.includes("my mom") || text.includes("mama") || text.includes("mum")) {
    characters.push("mother figure")
  }
  if (text.includes("my son") || text.includes("my boy")) {
    characters.push("young son")
  }
  if (text.includes("my daughter") || text.includes("my girl")) {
    characters.push("young daughter")
  }
  if (text.includes("my husband") || text.includes("my wife") || text.includes("spouse")) {
    characters.push("spouse")
  }
  if (text.includes("grandmother") || text.includes("gogo") || text.includes("granny")) {
    characters.push("grandmother")
  }
  if (text.includes("grandfather") || text.includes("grandpa")) {
    characters.push("grandfather")
  }
  if (text.includes("children") || text.includes("kids")) {
    characters.push("children")
  }
  if (text.includes("baby") || text.includes("infant")) {
    characters.push("baby")
  }
  if (text.includes("friend") || text.includes("friends")) {
    characters.push("friends")
  }

  // Detect emotional tone
  if (text.includes("happy") || text.includes("joy") || text.includes("blessed") || text.includes("grateful") || text.includes("celebrate")) {
    emotions.push("joyful", "celebratory")
  }
  if (text.includes("sad") || text.includes("sorrow") || text.includes("grief") || text.includes("mourning")) {
    emotions.push("sorrowful", "grieving")
  }
  if (text.includes("angry") || text.includes("rage") || text.includes("furious") || text.includes("betrayed")) {
    emotions.push("angry", "conflicted")
  }
  if (text.includes("scared") || text.includes("afraid") || text.includes("fear") || text.includes("terrified")) {
    emotions.push("fearful", "anxious")
  }
  if (text.includes("hope") || text.includes("hopeful") || text.includes("better days")) {
    emotions.push("hopeful", "optimistic")
  }
  if (text.includes("lonely") || text.includes("alone") || text.includes("isolated")) {
    emotions.push("lonely", "isolated")
  }
  if (text.includes("love") || text.includes("loved") || text.includes("caring")) {
    emotions.push("loving", "warm")
  }
  if (text.includes("proud") || text.includes("achievement") || text.includes("success")) {
    emotions.push("proud", "accomplished")
  }
  if (text.includes("confused") || text.includes("lost") || text.includes("uncertain")) {
    emotions.push("confused", "searching")
  }
  if (text.includes("peaceful") || text.includes("calm") || text.includes("healing")) {
    emotions.push("peaceful", "healing")
  }

  // Detect settings
  if (text.includes("township") || text.includes("kasi") || text.includes("location")) {
    settings.push("South African township with RDP houses")
  }
  if (text.includes("rural") || text.includes("village") || text.includes("farm") || text.includes("countryside")) {
    settings.push("rural South African village with traditional huts")
  }
  if (text.includes("city") || text.includes("johannesburg") || text.includes("joburg") || text.includes("cape town") || text.includes("durban")) {
    settings.push("South African city skyline")
  }
  if (text.includes("hospital") || text.includes("clinic") || text.includes("doctor")) {
    settings.push("hospital corridor")
  }
  if (text.includes("school") || text.includes("classroom") || text.includes("teacher") || text.includes("university")) {
    settings.push("school or university")
  }
  if (text.includes("prison") || text.includes("jail") || text.includes("cell") || text.includes("correctional")) {
    settings.push("prison gates")
  }
  if (text.includes("shack") || text.includes("informal")) {
    settings.push("informal settlement")
  }
  if (text.includes("beach") || text.includes("ocean") || text.includes("sea")) {
    settings.push("South African beach")
  }
  if (text.includes("mountain") || text.includes("table mountain") || text.includes("drakensberg")) {
    settings.push("mountain landscape")
  }
  if (text.includes("home") || text.includes("house") || text.includes("living room") || text.includes("bedroom")) {
    settings.push("humble home interior")
  }
  if (text.includes("funeral") || text.includes("cemetery") || text.includes("grave") || text.includes("burial")) {
    settings.push("cemetery or funeral scene")
  }
  if (text.includes("wedding") || text.includes("lobola") || text.includes("marriage ceremony")) {
    settings.push("wedding celebration")
  }
  if (text.includes("taxi") || text.includes("taxi rank") || text.includes("minibus")) {
    settings.push("taxi rank")
    objects.push("minibus taxi")
  }
  if (text.includes("shebeen") || text.includes("tavern")) {
    settings.push("local tavern")
  }

  // Detect objects
  if (text.includes("phone") || text.includes("cellphone") || text.includes("call")) {
    objects.push("cellphone")
  }
  if (text.includes("letter") || text.includes("wrote")) {
    objects.push("letter")
  }
  if (text.includes("photo") || text.includes("picture") || text.includes("photograph")) {
    objects.push("old photograph")
  }
  if (text.includes("money") || text.includes("cash") || text.includes("salary") || text.includes("broke")) {
    objects.push("money")
  }
  if (text.includes("food") || text.includes("hungry") || text.includes("meal") || text.includes("pap")) {
    objects.push("food")
  }
  if (text.includes("car") || text.includes("driving") || text.includes("vehicle")) {
    objects.push("car")
  }
  if (text.includes("alcohol") || text.includes("drinking") || text.includes("drunk") || text.includes("bottle")) {
    objects.push("bottle")
  }
  if (text.includes("bible") || text.includes("scripture")) {
    objects.push("bible")
  }
  if (text.includes("traditional") || text.includes("ancestors") || text.includes("sangoma")) {
    objects.push("traditional items")
    settings.push("traditional setting")
  }

  // Detect time of day
  if (text.includes("morning") || text.includes("sunrise") || text.includes("dawn")) {
    timeOfDay = "early morning sunrise"
  } else if (text.includes("afternoon") || text.includes("midday")) {
    timeOfDay = "bright afternoon"
  } else if (text.includes("evening") || text.includes("sunset") || text.includes("dusk")) {
    timeOfDay = "golden sunset"
  } else if (text.includes("night") || text.includes("midnight") || text.includes("dark")) {
    timeOfDay = "nighttime with street lights"
  }

  // Detect weather
  if (text.includes("rain") || text.includes("raining") || text.includes("storm")) {
    weather = "rainy, stormy"
  } else if (text.includes("sunny") || text.includes("hot") || text.includes("summer")) {
    weather = "bright sunshine"
  } else if (text.includes("cold") || text.includes("winter")) {
    weather = "cold winter atmosphere"
  }

  // Default settings based on category
  if (settings.length === 0) {
    switch (category) {
      case "family":
        settings.push("warm family home")
        break
      case "relationships":
        settings.push("intimate setting")
        break
      case "mental-health":
        settings.push("quiet contemplative space")
        break
      case "career":
        settings.push("workplace or city")
        break
      case "community":
        settings.push("township community")
        break
      default:
        settings.push("South African landscape")
    }
  }

  // Default emotions if none detected
  if (emotions.length === 0) {
    emotions.push("contemplative", "reflective")
  }

  return {
    scenes,
    characters,
    emotions,
    actions,
    settings,
    objects,
    timeOfDay,
    weather,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, category, userEthnicity, userGender, userFullName } = await request.json()

    if (!title && !content) {
      return NextResponse.json(
        { error: "Title or content is required" },
        { status: 400 }
      )
    }

    // Strip HTML and get full text for analysis
    const cleanContent = content ? content.replace(/<[^>]*>/g, "") : ""
    
    // Analyze user's name for ethnicity and gender if not explicitly set
    const nameAnalysis = analyzeNameForEthnicityAndGender(userFullName)
    
    // Get user representation (explicit settings take priority, then name-based)
    const ethnicity = getEthnicityDescription(userEthnicity, nameAnalysis.ethnicity)
    const gender = getGenderDescription(userGender, nameAnalysis.gender)
    
    // Analyze the story comprehensively
    const analysis = analyzeStory(cleanContent, title || "", category || "")
    
    // Build the character description
    const mainCharacter = `${ethnicity} ${gender}`
    
    // Build scene description from analysis
    const sceneElements = []
    if (analysis.actions.length > 0) {
      sceneElements.push(analysis.actions[0])
    }
    if (analysis.characters.length > 0) {
      sceneElements.push(`with ${analysis.characters.slice(0, 2).join(" and ")}`)
    }
    
    const settingDescription = analysis.settings[0] || "South African township"
    const emotionalTone = analysis.emotions.slice(0, 2).join(", ") || "contemplative"
    const objectsInScene = analysis.objects.length > 0 ? `Include: ${analysis.objects.slice(0, 3).join(", ")}` : ""

    const imagePrompt = `Cinematic digital illustration, graphic novel style, professional book cover art.

MAIN SUBJECT: A ${mainCharacter}${sceneElements.length > 0 ? ` ${sceneElements.join(" ")}` : ""}, shown with visible features and skin tone.

SETTING: ${settingDescription}, during ${analysis.timeOfDay}, ${analysis.weather}.

MOOD: ${emotionalTone} atmosphere.

${objectsInScene}

STORY CONTEXT: "${title || 'A South African Story'}"

STYLE REQUIREMENTS:
- Rich, vibrant colors with dramatic lighting
- Detailed illustration showing the character's ethnicity accurately
- Character can be shown from side profile, three-quarter view, or dramatic angle
- Cinematic composition like a movie poster
- South African cultural authenticity in clothing, setting, and atmosphere
- Emotional and powerful visual storytelling
- Professional quality suitable for publication
- Leave some space at top for potential text overlay
- NO TEXT, NO WORDS, NO LETTERS, NO WRITING in the image itself`

    // Generate image using fal schnell model
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: imagePrompt,
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
      },
    }) as { images?: { url: string }[] }

    // Extract the image URL from the result
    const imageUrl = result.images?.[0]?.url

    if (!imageUrl) {
      throw new Error("No image generated")
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Error generating cover image:", error)
    return NextResponse.json(
      { error: "Failed to generate cover image" },
      { status: 500 }
    )
  }
}
