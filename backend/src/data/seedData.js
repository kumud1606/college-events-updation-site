export const seedClubs = [
  {
    code: "DEBSOC",
    slug: "debating",
    name: "DebSoc",
    shortName: "DebSoc",
    logoUrl: "/assets/debsoc_logo.png",
    color: "#b11c1c",
    description: "Parliamentary debates, MUN practice, and public speaking sessions.",
    contactNumber: "+91 9876500011",
    headName: "Dr. Ritu Sharma",
    enquiryInfo: "Visit the Humanities block office between 11 AM and 2 PM for club enquiries.",
    teachers: ["Dr. Ritu Sharma", "Prof. Kunal Bhandari"]
  },
  {
    code: "NCC",
    slug: "ncc",
    name: "NCC",
    shortName: "NCC",
    color: "#1f4f8f",
    description: "Leadership drills, discipline training, and campus service."
  },
  {
    code: "NSS",
    slug: "nss",
    name: "NSS",
    shortName: "NSS",
    color: "#1b7f5a",
    description: "Volunteer drives, social outreach, and awareness campaigns."
  },
  {
    code: "ART",
    slug: "art-craft",
    name: "Art and Craft Club",
    shortName: "Art",
    color: "#9f5f12",
    description: "Sketching, installations, exhibition prep, and handmade decor."
  },
  {
    code: "DANCE",
    slug: "dance",
    name: "Dance Club",
    shortName: "Dance",
    color: "#6d2db4",
    description: "Contemporary, folk, and stage performance rehearsals."
  },
  {
    code: "MUSIC",
    slug: "music",
    name: "Music Club",
    shortName: "Music",
    color: "#d1476c",
    description: "Singing circles, jam sessions, and live acoustic showcases."
  },
  {
    code: "DRAMA",
    slug: "drama",
    name: "Dramatics Club",
    shortName: "Drama",
    color: "#3c2e7a",
    description: "Street plays, theatre workshops, and stage production."
  },
  {
    code: "CODE",
    slug: "coding",
    name: "Coding Club",
    shortName: "Code",
    color: "#0d6f76",
    description: "Hackathons, coding sprints, and peer-led technical sessions."
  },
  {
    code: "GRAFEST",
    slug: "grafest",
    name: "Grafest",
    shortName: "Grafest",
    color: "#1447a6",
    description: "Fest auditions, volunteer drives, and major campus celebration updates.",
    contactNumber: "+91 9876500088",
    headName: "Prof. Nivedita Rawat",
    enquiryInfo: "Student Activity Cell, Main Block, 10 AM to 4 PM.",
    teachers: ["Prof. Nivedita Rawat", "Dr. Aman Sethi", "Prof. Shalini Joshi"]
  },
  {
    code: "CONF",
    slug: "conference",
    name: "Conference Section",
    shortName: "Conference",
    color: "#2c5b8a",
    description: "Official university conferences, research forums, and academic gathering announcements."
  },
  {
    code: "DONATE",
    slug: "donation-drive",
    name: "Donation Drive",
    shortName: "Donation",
    color: "#2e7d5d",
    description: "Clothing, book, food, stationery, and community donation campaigns across campus."
  },
  {
    code: "SHAN",
    slug: "shanmanah",
    name: "ShanManah",
    shortName: "ShanManah",
    logoUrl: "/assets/shanmanah-logo.png",
    color: "#8a4a8c",
    description: "The Intra-University Psychology Club presenting expressive and immersive campus events.",
    contactNumber: "+91 9876500123",
    headName: "Dr. Meenakshi Arora",
    enquiryInfo: "Psychology Department Help Desk, weekdays after 1 PM.",
    teachers: ["Dr. Meenakshi Arora", "Prof. Ishita Verma"]
  }
];

export const seedUsers = [
  {
    enrollment: "GEU2026001",
    name: "Admin User",
    email: "admin@geu.demo",
    password: "Admin@123",
    role: "admin",
    onboardingComplete: true,
    clubs: []
  },
  {
    enrollment: "GEU2026101",
    name: "Grafest Manager",
    email: "grafest.manager@geu.demo",
    password: "Manager@123",
    role: "manager",
    onboardingComplete: true,
    clubs: ["grafest"]
  },
  {
    enrollment: "GEU2026201",
    name: "Student Demo",
    email: "student@geu.demo",
    password: "Student@123",
    role: "student",
    onboardingComplete: true,
    clubs: ["grafest", "debating", "shanmanah"]
  }
];

export const seedEvents = [
  {
    clubSlug: "grafest",
    title: "Auditions for Grafest Volunteers",
    startDate: "2026-03-25T10:00:00+05:30",
    endDate: "2026-03-25T17:00:00+05:30",
    venue: "CSIT Seminar Hall",
    imageUrl: "/assets/grafest.png",
    caption:
      "The stage is set. The energy is building. And Grafest is calling.\n\nGraphic Era invites passionate, creative, and driven students to step forward and be a part of something extraordinary. Join us for the Grafest Volunteer Auditions and become the force behind one of the most awaited celebrations on campus.\n\nFrom managing moments to creating memories - this is your chance to lead, learn, and leave your mark.",
    tags: ["Volunteer Auditions", "Annual Fest", "Student Leaders"]
  },
  {
    clubSlug: "shanmanah",
    title: "Psych Express",
    startDate: "2026-03-27T09:00:00+05:30",
    endDate: "2026-03-28T20:00:00+05:30",
    venue: "CSIT Auditorium",
    mediaType: "video",
    videoUrl: "/assets/pshyc1.mp4",
    imageUrl: "/assets/Last%20time%20it%20was%20unforgettable.This%20time%E2%80%A6%20it%E2%80%99s%20going%20to%20be%20more%20glamorous.The%20wait,%20the%20excitement,%20the%20chaos%20everything%20returns%20with%20Psych%20Express.More%20energy.More%20memories.More%20moments%20we%20won%E2%80%99t%20forget.Stay%20close.Something%20exciting%20is%20on%20its%20way.%20%F0%9F%9A%82.P.png",
    posterUrl: "/assets/Last%20time%20it%20was%20unforgettable.This%20time%E2%80%A6%20it%E2%80%99s%20going%20to%20be%20more%20glamorous.The%20wait,%20the%20excitement,%20the%20chaos%20everything%20returns%20with%20Psych%20Express.More%20energy.More%20memories.More%20moments%20we%20won%E2%80%99t%20forget.Stay%20close.Something%20exciting%20is%20on%20its%20way.%20%F0%9F%9A%82.P.png",
    caption:
      "Last time it was unforgettable. This time... it's going to be more glamorous.\n\nThe wait, the excitement, the chaos - everything returns with Psych Express.\n\nMore energy. More memories. More moments we won't forget.\n\nStay close. Something exciting is on its way.",
    tags: ["Psychology Club", "Open Event", "Campus Reel"]
  },
  {
    clubSlug: "debating",
    title: "Saajhi Virasat",
    startDate: "2025-10-04T09:00:00+05:30",
    endDate: "2025-10-04T18:00:00+05:30",
    venue: "BTech Block",
    imageUrl: "/assets/debate_event1.png",
    caption:
      "Get ready to be part of Saajhi Virasat, an exciting line-up of activities organized on the occasion of International Non-Violence Day.\n\nAttractive prizes for winners, certificates for participants, and a day full of debates, quiz rounds, and creative competitions.",
    tags: ["International Non-Violence Day", "Quiz", "Debate", "Reel Competition"]
  }
];

export const seedNotices = [
  {
    title: "University Notice Board",
    message:
      "This board is reserved for official notices. Students and managers can view updates here, while posting access will be added later through the admin dashboard.",
    priority: "important",
    audience: "all"
  },
  {
    title: "Campus Event Guidelines",
    message:
      "Please verify event timings and venue changes before attending. Follow club instructions and keep your profile information updated for notices and certificates.",
    priority: "normal",
    audience: "all"
  }
];
