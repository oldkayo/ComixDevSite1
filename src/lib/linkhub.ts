import { db } from "./db";

// 1. Fetch or initialize LinkHub Settings
export async function getLinkHubSettings() {
  try {
    let settings = await db.linkHubSettings.findFirst();
    if (!settings) {
      settings = await db.linkHubSettings.create({
        data: {
          title: "ComixDev Connect",
          description: "كل ما تحتاجه للوصول السريع إلى ورشات، فعاليات، ومحتوى ComixDev التقني في مكان واحد.",
          logo: null,
          coverImage: null,
          isEnabled: true,
        },
      });
      console.log("Default LinkHub Settings initialized.");
    }
    return settings;
  } catch (error) {
    console.error("Failed to fetch LinkHub Settings:", error);
    return {
      id: "fallback",
      title: "ComixDev Connect",
      description: "كل ما تحتاجه للوصول السريع إلى ورشات، فعاليات، ومحتوى ComixDev التقني في مكان واحد.",
      logo: null,
      coverImage: null,
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

// 2. Fetch or seed default Social Platforms
export async function getSocialPlatforms(onlyEnabled = false) {
  const defaultPlatforms = [
    { platform: "Instagram", displayOrder: 1, icon: "Instagram" },
    { platform: "LinkedIn", displayOrder: 2, icon: "Linkedin" },
    { platform: "TikTok", displayOrder: 3, icon: "Share2" },
    { platform: "YouTube", displayOrder: 4, icon: "Youtube" },
    { platform: "X", displayOrder: 5, icon: "Twitter" },
    { platform: "Facebook", displayOrder: 6, icon: "Facebook" },
    { platform: "Discord", displayOrder: 7, icon: "MessageSquare" },
    { platform: "GitHub", displayOrder: 8, icon: "Github" },
    { platform: "WhatsApp", displayOrder: 9, icon: "Phone" },
    { platform: "Telegram", displayOrder: 10, icon: "Send" },
    { platform: "Website", displayOrder: 11, icon: "Globe" },
  ];

  try {
    let platforms = await db.socialPlatform.findMany({
      orderBy: { displayOrder: "asc" },
    });

    if (platforms.length === 0) {
      // Seed default platforms
      const promises = defaultPlatforms.map((p) =>
        db.socialPlatform.create({
          data: {
            platform: p.platform,
            icon: p.icon,
            url: "",
            isEnabled: false,
            displayOrder: p.displayOrder,
          },
        })
      );
      platforms = await Promise.all(promises);
      console.log("Default Social Platforms seeded.");
    }

    if (onlyEnabled) {
      return platforms.filter((p) => p.isEnabled && p.url.trim() !== "");
    }
    return platforms;
  } catch (error) {
    console.error("Failed to fetch or seed Social Platforms:", error);
    return [];
  }
}

// 3. Fetch custom redirection links
export async function getCustomLinks(onlyEnabled = false) {
  try {
    const links = await db.customLink.findMany({
      where: onlyEnabled ? { isEnabled: true } : undefined,
      orderBy: { displayOrder: "asc" },
    });
    return links;
  } catch (error) {
    console.error("Failed to fetch Custom Links:", error);
    return [];
  }
}
