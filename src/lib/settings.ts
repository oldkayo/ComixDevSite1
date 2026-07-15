import { db } from "./db";

// 1. Fetch or initialize SiteSettings
export async function getSiteSettings() {
  try {
    let settings = await db.siteSettings.findFirst();
    if (!settings) {
      settings = await db.siteSettings.create({
        data: {
          siteName: "ComixDev",
          siteDescription: "منصة لورشات تقنية وذكاء اصطناعي",
          siteLogo: "",
          favicon: "",
          primaryColor: "#06b6d4",
          secondaryColor: "#a855f7",
          contactEmail: "info@comixdev.com",
          contactPhone: "+966500000000",
          address: "الرياض، المملكة العربية السعودية",
          copyrightText: "جميع الحقوق محفوظة © ComixDev 2026",
          statsWorkshopsCount: 15,
          statsStudentsCount: 450,
          statsCertificatesCount: 120,
          statsProjectsCount: 30,
        },
      });
      console.log("Default site settings initialized.");
    }
    return settings;
  } catch (error) {
    console.error("Failed to fetch site settings, returning defaults:", error);
    return {
      id: "default",
      siteName: "ComixDev",
      siteDescription: "منصة لورشات تقنية وذكاء اصطناعي",
      siteLogo: "",
      favicon: "",
      primaryColor: "#06b6d4",
      secondaryColor: "#a855f7",
      contactEmail: "info@comixdev.com",
      contactPhone: "+966500000000",
      address: "الرياض، المملكة العربية السعودية",
      copyrightText: "جميع الحقوق محفوظة © ComixDev 2026",
      statsWorkshopsCount: 15,
      statsStudentsCount: 450,
      statsCertificatesCount: 120,
      statsProjectsCount: 30,
    };
  }
}

// 2. Fetch or initialize Social Links
export async function getSocialLinks() {
  try {
    let socials = await db.socialLink.findMany();
    if (socials.length === 0) {
      const defaults = [
        { platform: "GitHub", url: "https://github.com", icon: "Github", isVisible: true },
        { platform: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin", isVisible: true },
        { platform: "X", url: "https://x.com", icon: "Twitter", isVisible: true },
      ];
      for (const d of defaults) {
        await db.socialLink.create({ data: d });
      }
      socials = await db.socialLink.findMany();
      console.log("Default social links initialized.");
    }
    return socials;
  } catch (error) {
    console.error("Failed to query social links:", error);
    return [];
  }
}

// 3. Fetch or initialize Navigation Links
export async function getNavigationLinks() {
  try {
    let links = await db.navigationLink.findMany({
      orderBy: { order: "asc" },
    });
    if (links.length === 0) {
      const defaults = [
        { name: "الرئيسية", url: "/", type: "NAVBAR", order: 1, isVisible: true },
        { name: "الورشات", url: "/workshops", type: "NAVBAR", order: 2, isVisible: true },
        { name: "البرومبتات", url: "/prompts", type: "NAVBAR", order: 3, isVisible: true },
        { name: "الفعاليات", url: "/events", type: "NAVBAR", order: 4, isVisible: true },
        { name: "من نحن", url: "/about", type: "NAVBAR", order: 5, isVisible: true },
        { name: "اتصل بنا", url: "/contact", type: "NAVBAR", order: 6, isVisible: true },
        // Footer links
        { name: "الرئيسية", url: "/", type: "FOOTER", order: 1, isVisible: true },
        { name: "الورشات", url: "/workshops", type: "FOOTER", order: 2, isVisible: true },
        { name: "البرومبتات", url: "/prompts", type: "FOOTER", order: 3, isVisible: true },
        { name: "الفعاليات", url: "/events", type: "FOOTER", order: 4, isVisible: true },
      ];
      for (const d of defaults) {
        await db.navigationLink.create({ data: d as any });
      }
      links = await db.navigationLink.findMany({
        orderBy: { order: "asc" },
      });
      console.log("Default navigation links initialized.");
    }
    return links;
  } catch (error) {
    console.error("Failed to query navigation links:", error);
    return [];
  }
}

// 4. Fetch or initialize SEOSettings for page
export async function getSEOSettings(pageName: string) {
  try {
    let seo = await db.sEOSettings.findUnique({
      where: { page: pageName },
    });
    if (!seo) {
      const defaultTitles: Record<string, string> = {
        home: "الرئيسية | ComixDev ورش تقنية وذكاء اصطناعي",
        workshops: "الورشات التدريبية المباشرة | ComixDev",
        prompts: "مكتبة البرومبتات والذكاء الاصطناعي | ComixDev",
        events: "الفعاليات والمؤتمرات التقنية | ComixDev",
        gallery: "معرض الصور وتغطيات الفعاليات | ComixDev",
        partners: "الشركاء والجهات الداعمة | ComixDev",
        contact: "اتصل بنا وتواصل مع خبرائنا | ComixDev",
        about: "من نحن وقصة تأسيس ComixDev",
      };
      
      const defaultDescs: Record<string, string> = {
        home: "منصة رائدة لتقديم ورش العمل التقنية التدريبية وتوفير موجهات وأوامر AI جاهزة للمطورين.",
        workshops: "سجل الآن في الورشات التدريبية المباشرة حول هندسة البرمجيات والـ AI.",
        prompts: "مجموعة منسقة وعالية الأداء من الأوامر والبرومبتات الجاهزة لزيادة إنتاجيتك بالـ AI.",
        events: "شاهد التغطيات والفعاليات والهاكاثونات الكبرى التي أقامتها منصة ComixDev.",
        gallery: "صور وفيديوهات حية من ورش عمل وفعاليات وتحديات هاكاثون ComixDev.",
        partners: "تعرف على الشركات وجامعات التدريب والجهات المستضيفة الداعمة لمنصتنا.",
        contact: "تواصل معنا مباشرة عبر البريد أو الهاتف أو الواتساب للاستفسارات التقنية والشراكات.",
        about: "تعرف على رؤيتنا وأهدافنا لتمكين المطورين العرب بأدوات العصر والذكاء الاصطناعي.",
      };

      seo = await db.sEOSettings.create({
        data: {
          page: pageName,
          title: defaultTitles[pageName] || "ComixDev",
          description: defaultDescs[pageName] || "ورش عمل برمجية وذكاء اصطناعي",
          keywords: "ذكاء اصطناعي, برمجة, Next.js, ورش عمل, هاكاثون",
        },
      });
      console.log(`Default SEO settings created for: ${pageName}`);
    }
    return seo;
  } catch (error) {
    console.error(`Failed to fetch SEO settings for ${pageName}:`, error);
    return {
      id: "fallback",
      page: pageName,
      title: "ComixDev",
      description: "منصة ورشات تقنية وذكاء اصطناعي",
      keywords: "برمجة, ذكاء اصطناعي",
      ogImage: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

// 5. Fetch or initialize Hero Settings
export async function getHeroSettings() {
  try {
    let hero = await db.heroSectionSettings.findFirst();
    if (!hero) {
      hero = await db.heroSectionSettings.create({
        data: {
          title: "Build. Learn. Innovate with AI",
          description: "نساعدك على تطوير مهاراتك التقنية الحقيقية من خلال ورشات عمل تفاعلية، دورات متخصصة، ومكتبة برومبتات جاهزة تمكنك من قيادة مستقبل الذكاء الاصطناعي.",
          backgroundImage: "",
          buttonText1: "استكشف الورشات القادمة",
          buttonLink1: "/workshops",
          buttonText2: "أنشئ حسابك مجاناً",
          buttonLink2: "/register",
        },
      });
      console.log("Default hero settings initialized.");
    }
    return hero;
  } catch (error) {
    console.error("Failed to fetch hero settings:", error);
    return {
      title: "Build. Learn. Innovate with AI",
      description: "نساعدك على تطوير مهاراتك التقنية الحقيقية من خلال ورشات عمل تفاعلية، دورات متخصصة، ومكتبة برومبتات جاهزة تمكنك من قيادة مستقبل الذكاء الاصطناعي.",
      backgroundImage: "",
      buttonText1: "استكشف الورشات القادمة",
      buttonLink1: "/workshops",
      buttonText2: "أنشئ حسابك مجاناً",
      buttonLink2: "/register",
    };
  }
}

// 6. Fetch or initialize Why ComixDev items
export async function getWhyItems() {
  try {
    let items = await db.whyComixDevItem.findMany({
      orderBy: { order: "asc" },
    });
    if (items.length === 0) {
      const defaults = [
        { title: "تعلم تطبيقي وعملي", description: "ابتعد عن النظريات العقيمة؛ جميع ورشاتنا تعتمد على كتابة الأكواد البرمجية وبناء تطبيقات تعمل على أرض الواقع.", icon: "Cpu", order: 1 },
        { title: "أدوات وتقنيات العصر", description: "نتناول أحدث منصات الذكاء الاصطناعي وأطر العمل مثل LLMs و LangChain ومستجدات Next.js بشكل فوري.", icon: "Zap", order: 2 },
        { title: "مشاريع تخرج حقيقية", description: "تقوم ببناء مشروع متكامل خلال الورشة لتضمه فوراً إلى ملف أعمالك الشخصي وجذب أصحاب العمل.", icon: "Layers", order: 3 },
        { title: "نظام نقاط الولاء والشهادات", description: "اكتسب نقاط ولاء مع كل ورشة تشارك بها واستبدلها بمزايا حصرية، بجانب الحصول على شهادات إتمام موثقة.", icon: "Award", order: 4 },
      ];
      for (const d of defaults) {
        await db.whyComixDevItem.create({ data: d });
      }
      items = await db.whyComixDevItem.findMany({
        orderBy: { order: "asc" },
      });
      console.log("Default why items initialized.");
    }
    return items;
  } catch (error) {
    console.error("Failed to query why items:", error);
    return [];
  }
}

// 7. Fetch or initialize Testimonials
export async function getTestimonials() {
  try {
    return await db.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to query testimonials:", error);
    return [];
  }
}

// 8. Fetch or initialize About Us Settings
export async function getAboutUsSettings() {
  try {
    let settings = await db.aboutUsSettings.findFirst();
    if (!settings) {
      settings = await db.aboutUsSettings.create({
        data: {
          title: "من نحن",
          description: "ComixDev هي منصة رائدة لتقديم ورش العمل التقنية التدريبية وتوفير موجهات وأوامر AI جاهزة للمطورين.",
          mission: "تمكين المطورين العرب بأدوات العصر والذكاء الاصطناعي لبناء مستقبل أفضل.",
          vision: "أن نكون المرجعية الأولى للمطورين العرب في مجال التكنولوجيا والذكاء الاصطناعي.",
          values: "الابتكار، الجودة، التعاون، المصداقية.",
        },
      });
      console.log("Default about us settings initialized.");
    }
    return settings;
  } catch (error) {
    console.error("Failed to fetch about us settings:", error);
    return {
      id: "default",
      title: "من نحن",
      description: "ComixDev هي منصة رائدة لتقديم ورش العمل التقنية التدريبية وتوفير موجهات وأوامر AI جاهزة للمطورين.",
      mission: "تمكين المطورين العرب بأدوات العصر والذكاء الاصطناعي لبناء مستقبل أفضل.",
      vision: "أن نكون المرجعية الأولى للمطورين العرب في مجال التكنولوجيا والذكاء الاصطناعي.",
      values: "الابتكار، الجودة، التعاون، المصداقية.",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

// 9. Fetch or initialize Team Members
export async function getTeamMembers() {
  try {
    return await db.teamMember.findMany({
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Failed to query team members:", error);
    return [];
  }
}

// 10. Fetch or initialize Contact Form Settings
export async function getContactFormSettings() {
  try {
    let settings = await db.contactFormSettings.findFirst();
    if (!settings) {
      settings = await db.contactFormSettings.create({
        data: {
          isFormEnabled: true,
          receiveEmails: true,
          successMessage: "شكراً لاتصالك! سنعود إليك قريباً.",
          autoReplyMessage: "شكراً لاتصالك! هذا هو رد تلقائي.",
        },
      });
      console.log("Default contact form settings initialized.");
    }
    return settings;
  } catch (error) {
    console.error("Failed to fetch contact form settings:", error);
    return {
      id: "default",
      isFormEnabled: true,
      receiveEmails: true,
      successMessage: "شكراً لاتصالك! سنعود إليك قريباً.",
      autoReplyMessage: "شكراً لاتصالك! هذا هو رد تلقائي.",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

// 11. Fetch Contact Messages
export async function getContactMessages() {
  try {
    return await db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch contact messages:", error);
    return [];
  }
}
