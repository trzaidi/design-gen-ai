// Curated on October 25, 2026. News is dated; comic setups are imagined.
// Source context is supplied to the model so it need not invent campus facts.
export type MaterialTopic = {
 id:string; title:string; category:"In the news"|"Campus life"; imagePath:string;
 scene:string; fact:string; example:string; sources:{label:string;url:string}[];
};
export const MATERIAL_CHECKED_DATE = "2026-10-25";
export const COLUMBIA_MATERIAL:MaterialTopic[] = [
  {
    "id": "cyber-training",
    "title": "Your training is overdue. Their breach is not.",
    "category": "In the news",
    "imagePath": "/memes/cu-lerner-hall.webp",
    "scene": "Your inbox has another security-training email from Columbia, alongside notices about the university’s 2025 data breach.",
    "fact": "CUIT documents emailed awareness lessons and phishing simulations; Columbia confirmed personal data was affected by its 2025 breach.",
    "example": "My cybersecurity training is overdue. Apparently so was theirs.",
    "sources": [
      {
        "label": "CUIT security training",
        "url": "https://www.cuit.columbia.edu/ciso/security-training"
      },
      {
        "label": "CUIT breach FAQ",
        "url": "https://www.cuit.columbia.edu/content/2025-cyber-incident-faq"
      }
    ]
  },
  {
    "id": "breach-paperwork",
    "title": "Data breach, now with more paperwork",
    "category": "In the news",
    "imagePath": "/memes/cu-low-library.webp",
    "scene": "Columbia’s October 23 cyberattack update tells affected people that an outside administrator will send instructions for settlement claims.",
    "fact": "On October 23, 2026, CUIT announced preliminary court approval of a settlement and a third-party claims process.",
    "example": "They lost my information and somehow I’m the one filling out forms.",
    "sources": [
      {
        "label": "CUIT update · Oct 23, 2026",
        "url": "https://www.cuit.columbia.edu/content/update-2025-cyberattack"
      }
    ]
  },
  {
    "id": "guest-qr",
    "title": "The sixth friend stays outside",
    "category": "In the news",
    "imagePath": "/memes/cu-college-walk.webp",
    "scene": "You try to bring six friends onto campus, then remember the five-person same-day guest authorization limit announced for students.",
    "fact": "The September 2026 access update increased student and staff same-day guest authorizations from two to five.",
    "example": "Friendship is unlimited. Same-day guest authorization is five.",
    "sources": [
      {
        "label": "Campus access update · Sep 7, 2026",
        "url": "https://president.columbia.edu/news/important-updates-regarding-campus-access"
      }
    ]
  },
  {
    "id": "access-committee",
    "title": "A committee to open a gate",
    "category": "In the news",
    "imagePath": "/memes/cu-low-library.webp",
    "scene": "You want a shorter walk across campus. Columbia announces an advisory committee to recommend steps toward greater access.",
    "fact": "Columbia announced a Campus Access Advisory Committee in September 2026.",
    "example": "At most schools you open a gate. Here you convene a committee.",
    "sources": [
      {
        "label": "Campus access update · Sep 7, 2026",
        "url": "https://president.columbia.edu/news/important-updates-regarding-campus-access"
      }
    ]
  },
  {
    "id": "ask-kiosk",
    "title": "An office for finding the entrance",
    "category": "In the news",
    "imagePath": "/memes/cu-college-walk.webp",
    "scene": "You reach 116th and Broadway and need help figuring out the campus access process before you can reach class.",
    "fact": "The September access update announced an October 1 Access Service Kiosk at 116th and Broadway.",
    "example": "Getting into Columbia was hard. Getting inside Columbia requires a help desk.",
    "sources": [
      {
        "label": "Campus access update · Sep 7, 2026",
        "url": "https://president.columbia.edu/news/important-updates-regarding-campus-access"
      }
    ]
  },
  {
    "id": "dining-currencies",
    "title": "One lunch, three currencies",
    "category": "Campus life",
    "imagePath": "/memes/cu-john-jay.webp",
    "scene": "You stand outside John Jay trying to remember whether lunch uses a meal swipe, Dining Dollars, or Flex.",
    "fact": "Columbia dining plans distinguish meal swipes, Dining Dollars and Flex, with different spending rules.",
    "example": "I came here to study economics. Lunch is the qualifying exam.",
    "sources": [
      {
        "label": "Dining guide · Aug 27, 2026",
        "url": "https://dining.columbia.edu/news/how-use-your-dining-plan"
      }
    ]
  },
  {
    "id": "saturday-swipes",
    "title": "The Saturday swipe liquidation",
    "category": "Campus life",
    "imagePath": "/memes/cu-john-jay.webp",
    "scene": "It is Saturday night and your unused weekly meal swipes are about to disappear at the Sunday reset.",
    "fact": "Weekly-plan swipes reset Sunday and do not carry forward to the next week.",
    "example": "My meal plan has a faster expiration date than the food.",
    "sources": [
      {
        "label": "Dining guide · Aug 27, 2026",
        "url": "https://dining.columbia.edu/news/how-use-your-dining-plan"
      }
    ]
  },
  {
    "id": "rollover-unlock",
    "title": "Finish the new meals to unlock the old meals",
    "category": "Campus life",
    "imagePath": "/memes/cu-john-jay.webp",
    "scene": "Your leftover fall meals exist, but you cannot use them until your spring term-plan meals are gone.",
    "fact": "Term-plan fall rollover meals become available after the spring allocation is used.",
    "example": "Even my leftovers have prerequisites.",
    "sources": [
      {
        "label": "Dining guide · Aug 27, 2026",
        "url": "https://dining.columbia.edu/news/how-use-your-dining-plan"
      }
    ]
  },
  {
    "id": "butler-overnight",
    "title": "Butler is open. Your brain is closed.",
    "category": "Campus life",
    "imagePath": "/memes/cu-butler-library.webp",
    "scene": "It is 3 a.m. in Butler and the only thing progressing is the number of browser tabs in your unfinished paper.",
    "fact": "Butler has 24/7 study areas during fall and spring semesters.",
    "example": "Butler offers 24-hour access to the consequences of my decisions.",
    "sources": [
      {
        "label": "Libraries: study spaces",
        "url": "https://library.columbia.edu/using-libraries/study-spaces.html"
      }
    ]
  },
  {
    "id": "study-room",
    "title": "A reservation for procrastination",
    "category": "Campus life",
    "imagePath": "/memes/cu-butler-library.webp",
    "scene": "Your group books a library study room and spends the entire meeting deciding what to order for dinner.",
    "fact": "Columbia Libraries offers reservable rooms for collaborative study and presentation practice.",
    "example": "We reserved a room so our group project could fail in private.",
    "sources": [
      {
        "label": "Libraries: study spaces",
        "url": "https://library.columbia.edu/using-libraries/study-spaces.html"
      }
    ]
  },
  {
    "id": "low-not-library",
    "title": "Low Library, minus the library",
    "category": "Campus life",
    "imagePath": "/memes/cu-low-library.webp",
    "scene": "You arrive at Low Library looking for books and discover that its main collection is university administration.",
    "fact": "Low was the main library until 1934; it is now Columbia’s administrative center.",
    "example": "A library without books. Finally, a building that matches my reading habits.",
    "sources": [
      {
        "label": "GSAPP campus tour",
        "url": "https://www.arch.columbia.edu/books/reader/1000-morningside-heights-br-self-guided-tour"
      }
    ]
  },
  {
    "id": "housing-lottery",
    "title": "Your apartment is a probability problem",
    "category": "Campus life",
    "imagePath": "/memes/cu-john-jay.webp",
    "scene": "Your room-selection lottery number is close to 5000 and your group starts redefining what counts as a good location.",
    "fact": "Eligible housing groups receive computer-generated lottery numbers; numbers nearer 5000 generally select later, within seniority rules.",
    "example": "Columbia taught me probability by assigning it to my living conditions.",
    "sources": [
      {
        "label": "Housing lottery rules",
        "url": "https://www.housing.columbia.edu/content/point-values-lottery-numbers-selection-appointments"
      }
    ]
  },
  {
    "id": "course-waitlist",
    "title": "A seat on the waitlist",
    "category": "Campus life",
    "imagePath": "/memes/cu-lerner-hall.webp",
    "scene": "You open Vergil hoping to build a class schedule and instead build a carefully balanced portfolio of waitlists.",
    "fact": "Vergil offers automatic and instructor-managed course waitlists; a waitlist place is not enrollment.",
    "example": "My major is computer science. My minor is refreshing Vergil.",
    "sources": [
      {
        "label": "Registrar: registration and waitlists",
        "url": "https://registrar.columbia.edu/content/class-registration-students"
      }
    ]
  },
  {
    "id": "swim-test",
    "title": "The final boss is 75 yards",
    "category": "Campus life",
    "imagePath": "/memes/cu-alma-mater.webp",
    "scene": "A Columbia College senior finishes the academic requirements and remembers the swim requirement still needs attention.",
    "fact": "Columbia College requires a swim test, qualifying course or approved exemption; the test is 75 yards. This is not a GS requirement.",
    "example": "Four years of the Core, and the final boss is water.",
    "sources": [
      {
        "label": "Swim requirement · Sep 9, 2026",
        "url": "https://perec.columbia.edu/swim-test-requirement"
      }
    ]
  },
  {
    "id": "south-lawn",
    "title": "The scenic route around South Lawn",
    "category": "Campus life",
    "imagePath": "/memes/cu-butler-library.webp",
    "scene": "You look from the Low Steps toward Butler and plan a dramatic detour around the blue fencing visible in the campus photo.",
    "fact": "This is a comic setup based on the fencing in the archive photo, not a report of a new construction closure.",
    "example": "Columbia’s most consistent curriculum is Introduction to Going Around.",
    "sources": [
      {
        "label": "GSAPP campus tour",
        "url": "https://www.arch.columbia.edu/books/reader/1000-morningside-heights-br-self-guided-tour"
      }
    ]
  }
];

export function findMaterialTopic(id:string|null|undefined) {
 return COLUMBIA_MATERIAL.find(topic=>topic.id===id);
}
export function dailyMaterial(date=new Date()) {
 const day=new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit"}).format(date);
 const index=Math.floor(Date.parse(`${day}T00:00:00Z`)/86400000)%COLUMBIA_MATERIAL.length;
 return {topic:COLUMBIA_MATERIAL[index],day};
}
