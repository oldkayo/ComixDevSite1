import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin User
  const adminEmail = "admin@comixdev.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin12345", 10);
    await prisma.user.create({
      data: {
        name: "مدير المنصة",
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        points: 100,
      },
    });
    console.log("Admin user created: admin@comixdev.com / admin12345");
  } else {
    console.log("Admin user already exists.");
  }

  // 2. Create Workshops
  const workshops = [
    {
      title: "ورشة الذكاء الاصطناعي ونماذج اللغات الكبيرة LLMs",
      slug: "ai-large-language-models",
      shortDescription: "تعلم كيفية بناء تطبيقات مخصصة باستخدام نماذج GPT و LangChain.",
      description: "تعلم كيفية بناء تطبيقات مخصصة باستخدام نماذج GPT و LangChain، وتطوير شات بوت متطور خطوة بخطوة. تغطي هذه الورشة معمارية المحولات، وطرق كتابة البرومبتات الفعالة للـ APIs، وربط قاعدة البيانات واسترجاع المعلومات.",
      coverImage: "/images/workshop_ai.png",
      date: new Date("2026-08-15T18:00:00Z"),
      duration: "3 ساعات",
      location: "عن بعد عبر Zoom",
      capacity: 30,
      pointsReward: 50,
      isPublished: true,
    },
    {
      title: "احترِف Next.js 16 وهندسة الواجهات الأمامية",
      slug: "nextjs-advanced-frontend",
      shortDescription: "ورشة عمل عملية لبناء مواقع ويب فائقة السرعة باستخدام Next.js 16.",
      description: "ورشة عمل عملية لبناء مواقع ويب فائقة السرعة وقابلة للتوسع باستخدام Next.js 16، الـ Server Actions ونظام Proxy الجديد لتمرير الطلبات وحماية لوحة التحكم.",
      coverImage: "/images/workshop_next.png",
      date: new Date("2026-08-22T17:00:00Z"),
      duration: "4 ساعات",
      location: "مكتب ComixDev بالرياض",
      capacity: 25,
      pointsReward: 60,
      isPublished: true,
    },
    {
      title: "هندسة البرومبتات للمحترفين Prompt Engineering",
      slug: "prompt-engineering-masterclass",
      shortDescription: "افهم الأسرار العميقة وراء كتابة الأوامر الفعالة لزيادة إنتاجيتك.",
      description: "افهم الأسرار العميقة وراء كتابة الأوامر البرمجية الفعالة للـ AI لزيادة إنتاجيتك وصياغة حلول متقدمة، مع تفادي مشاكل هلوسة النماذج.",
      coverImage: "/images/workshop_prompt.png",
      date: new Date("2026-08-29T19:00:00Z"),
      duration: "2 ساعات",
      location: "عن بعد عبر Google Meet",
      capacity: 40,
      pointsReward: 30,
      isPublished: true,
    },
  ];

  for (const workshop of workshops) {
    const existing = await prisma.workshop.findUnique({
      where: { slug: workshop.slug },
    });
    if (!existing) {
      await prisma.workshop.create({ data: workshop });
      console.log(`Workshop created: ${workshop.title}`);
    }
  }

  // 3. Create Prompt Categories
  const promptCategories = [
    { name: "ذكاء اصطناعي", slug: "ai", icon: "Sparkles" },
    { name: "برمجة", slug: "programming", icon: "Code" },
    { name: "تصميم", slug: "design", icon: "Palette" },
    { name: "تسويق", slug: "marketing", icon: "Share2" },
    { name: "إنتاجية", slug: "productivity", icon: "ClipboardList" },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of promptCategories) {
    let dbCat = await prisma.promptCategory.findUnique({
      where: { slug: cat.slug },
    });
    if (!dbCat) {
      dbCat = await prisma.promptCategory.create({ data: cat });
      console.log(`Prompt category created: ${cat.name}`);
    }
    categoryMap[cat.slug] = dbCat.id;
  }

  // 4. Create Prompts
  const prompts = [
    {
      title: "محلل الأكواد ومقترح التحسينات",
      slug: "code-analyzer-reviewer",
      categoryId: categoryMap["ai"],
      description: "يقوم بتحليل الكود البرمجي وشرحه بالتفصيل مع اقتراح تحسينات للأداء والحماية.",
      content: "Act as an expert software engineer and code reviewer. Analyze the following code: [insert code]. Explain what it does, highlight potential security flaws, resource leaks, or performance bottlenecks, and provide an optimized refactored version in TypeScript, using best coding standards.",
      tags: ["TypeScript", "Refactoring", "Clean Code"],
      thumbnail: "/images/workshop_prompt.png",
      isPublished: true,
      copyCount: 15,
      viewCount: 42,
    },
    {
      title: "مولد الـ Custom React Hooks",
      slug: "react-custom-hooks-generator",
      categoryId: categoryMap["programming"],
      description: "يساعدك على كتابة كود React Hooks لحل مشكلة محددة بسرعة.",
      content: "Generate a custom React hook in TypeScript for: [describe functionality, e.g., local storage sync]. Ensure it handles SSR edge cases, implements cleanup on unmount, contains full types, and provides a usage example.",
      tags: ["React", "TypeScript", "Hooks"],
      thumbnail: "/images/workshop_next.png",
      isPublished: true,
      copyCount: 23,
      viewCount: 56,
    },
    {
      title: "مصمم لوحات الألوان للواجهات الداكنة",
      slug: "dark-ui-palette-designer",
      categoryId: categoryMap["design"],
      description: "يولد لوحة ألوان متناسقة للواجهات المظلمة متوافقة مع Tailwind CSS.",
      content: "Design a modern dark UI color palette based on a primary neon accent [insert color, e.g., Cyan]. Output the Tailwind configuration colors, including background, surface, card, border, active state, and text shades that pass WCAG contrast accessibility guidelines.",
      tags: ["Tailwind", "Design System", "CSS"],
      thumbnail: "/images/workshop_ai.png",
      isPublished: true,
      copyCount: 8,
      viewCount: 29,
    },
    {
      title: "كاتب مقدمات المقالات التقنية (SEO)",
      slug: "tech-seo-intro-writer",
      categoryId: categoryMap["marketing"],
      description: "صياغة مقدمات مقالات مشوقة ومتوافقة مع محركات البحث.",
      content: "Write a high-converting, SEO-optimized blog post introduction for [insert topic]. Use the hook-problem-solution framework to engage technical developers. Target keyword: [insert keyword]. Keep it under 150 words.",
      tags: ["SEO", "Copywriting", "Marketing"],
      thumbnail: "/images/workshop_prompt.png",
      isPublished: true,
      copyCount: 12,
      viewCount: 33,
    },
    {
      title: "ملخص رسائل البريد واستخرج المهام",
      slug: "email-summarizer-tasks",
      categoryId: categoryMap["productivity"],
      description: "يلخص الرسائل الطويلة ويستخرج المهام المطلوبة مباشرة.",
      content: "Analyze the following email thread: [insert text]. Provide a 3-bullet-point executive summary, list any critical deadlines mentioned, and extract actionable items with their assignees in a clean markdown table.",
      tags: ["AI", "Productivity", "Workflow"],
      thumbnail: "/images/workshop_ai.png",
      isPublished: true,
      copyCount: 34,
      viewCount: 88,
    },
  ];

  for (const prompt of prompts) {
    const existing = await prisma.prompt.findUnique({
      where: { slug: prompt.slug },
    });
    if (!existing) {
      await prisma.prompt.create({ data: prompt });
      console.log(`Prompt created: ${prompt.title}`);
    }
  }

  // 5. Create Partners
  const partners = [
    { name: "المنصة الرقمية", logo: "/images/workshop_ai.png", website: "https://theplatform.com", description: "منصة تقنية لتمكين المطورين في المملكة." },
    { name: "جامعة الملك سعود", logo: "/images/workshop_next.png", website: "https://ksu.edu.sa", description: "المؤسسة التعليمية والبحثية الرائدة بالرياض." },
    { name: "شركة حلول الـ AI", logo: "/images/workshop_prompt.png", website: "https://aisolutions.com", description: "ابتكار وتطوير خوارزميات وحلول الذكاء الاصطناعي." },
  ];

  const dbPartners = [];
  for (const part of partners) {
    let dbPart = await prisma.partner.findFirst({
      where: { name: part.name }
    });
    if (!dbPart) {
      dbPart = await prisma.partner.create({ data: part });
      console.log(`Partner created: ${part.name}`);
    }
    dbPartners.push(dbPart);
  }

  // 6. Create Events
  const events = [
    {
      title: "مؤتمر الرياض للذكاء الاصطناعي 2026",
      slug: "riyadh-ai-summit-2026",
      description: "مؤتمر شامل يستعرض أحدث تقنيات نماذج اللغة الكبيرة وتطبيقاتها التفاعلية في السوق التقني العربي.",
      coverImage: "/images/workshop_ai.png",
      startDate: new Date("2026-09-10T09:00:00Z"),
      endDate: new Date("2026-09-12T18:00:00Z"),
      location: "مركز الرياض للمؤتمرات والمعارض",
      hostedBy: "ComixDev",
      attendeeCount: 1500,
      isPublished: true,
    },
    {
      title: "هاكاثون البرمجة والويب المتقدم 2026",
      slug: "advanced-web-hackathon-2026",
      description: "تحدي برمجي ممتد لـ 48 ساعة لبناء تطبيقات ويب متطورة وفائقة السرعة باستخدام Next.js و Neon.",
      coverImage: "/images/workshop_next.png",
      startDate: new Date("2026-10-15T08:00:00Z"),
      endDate: new Date("2026-10-17T20:00:00Z"),
      location: "مكتب حاضنة بادر التقنية بالرياض",
      hostedBy: "حاضنة بادر للتقنية",
      attendeeCount: 200,
      isPublished: true,
    }
  ];

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    let dbEv = await prisma.event.findUnique({
      where: { slug: ev.slug },
      include: { galleryItems: true, eventPartners: true }
    });
    if (!dbEv) {
      dbEv = await prisma.event.create({
        data: {
          title: ev.title,
          slug: ev.slug,
          description: ev.description,
          coverImage: ev.coverImage,
          startDate: ev.startDate,
          endDate: ev.endDate,
          location: ev.location,
          hostedBy: ev.hostedBy,
          attendeeCount: ev.attendeeCount,
          isPublished: ev.isPublished,
          eventPartners: {
            create: dbPartners.map(p => ({ partnerId: p.id }))
          }
        },
        include: { galleryItems: true, eventPartners: true }
      });
      console.log(`Event created: ${ev.title}`);

      // Create GalleryItems for this Event
      if (ev.slug === "riyadh-ai-summit-2026") {
        await prisma.galleryItem.createMany({
          data: [
            {
              eventId: dbEv.id,
              type: "IMAGE",
              title: "حفل الافتتاح الرئيسي للمؤتمر",
              fileUrl: "/images/workshop_ai.png"
            },
            {
              eventId: dbEv.id,
              type: "IMAGE",
              title: "الجلسة الحوارية حول نماذج اللغة الكبيرة LLMs",
              fileUrl: "/images/workshop_prompt.png"
            },
            {
              eventId: dbEv.id,
              type: "VIDEO",
              title: "تغطية اليوم الأول بالكامل بالفيديو",
              fileUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
            }
          ]
        });
      } else {
        await prisma.galleryItem.createMany({
          data: [
            {
              eventId: dbEv.id,
              type: "IMAGE",
              title: "فرق العمل وتطوير المشاريع البرمجية",
              fileUrl: "/images/workshop_next.png"
            },
            {
              eventId: dbEv.id,
              type: "IMAGE",
              title: "لحظات إعلان الفائزين وتسليم الجوائز بالهاكاثون",
              fileUrl: "/images/workshop_ai.png"
            }
          ]
        });
      }
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
