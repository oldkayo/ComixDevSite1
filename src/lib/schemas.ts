import { z } from "zod";

// Helper to convert string to boolean for isPublished
const stringToBoolean = z
  .string()
  .transform((val) => val === "true")
  .or(z.boolean());

// Helper to convert comma-separated string to string array
const stringToArray = z
  .union([z.array(z.string()), z.string()])
  .transform((val) => {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    return val.split(",").map(s => s.trim()).filter(Boolean);
  })
  .default([]);

// Workshop input validation schema
export const WorkshopSchema = z.object({
  title: z.string().min(3, "العنوان يجب أن يتكون من 3 أحرف على الأقل"),
  shortDescription: z.string().min(5, "الوصف المختصر يجب أن يتكون من 5 أحرف على الأقل"),
  description: z.string().min(10, "الوصف الكامل يجب أن يتكون من 10 أحرف على الأقل"),
  image: z.string().optional().or(z.literal("")), // coverImage
  date: z.string().min(1, "يرجى تحديد تاريخ الورشة"),
  startTime: z.string().optional().or(z.literal("")),
  endTime: z.string().optional().or(z.literal("")),
  duration: z.string().optional().default(""),
  location: z.string().min(3, "الموقع يجب أن يتكون من 3 أحرف على الأقل"),
  capacity: z.coerce.number().min(1, "السعة الاستيعابية يجب أن تكون أكبر من 0"),
  pointsReward: z.coerce.number().min(0, "نقاط الولاء لا يمكن أن تكون سالبة"),
  isPublished: stringToBoolean.default(false),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).default("UPCOMING"),
  // Fields for COMPLETED status
  attendeeCount: z.coerce.number().min(0).optional().default(0),
  workshopNotes: z.string().optional().or(z.literal("")),
  hostOrganization: z.string().optional().or(z.literal("")),
  galleryLink: z.string().optional().or(z.literal("")),
  workshopPhotos: stringToArray,
  workshopVideos: stringToArray,
});

// Register validation schema with passwords matching refine
export const RegisterSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يتكون من حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل"),
  confirmPassword: z.string().min(6, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

// Login validation schema
export const LoginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل"),
});



// Prompt validation schema
export const PromptSchema = z.object({
  title: z.string().min(3, "العنوان يجب أن يتكون من 3 أحرف على الأقل"),
  description: z.string().min(5, "الوصف يجب أن يتكون من 5 أحرف على الأقل"),
  content: z.string().min(10, "المحتوى يجب أن يتكون من 10 أحرف على الأقل"),
  categoryId: z.string().min(1, "يرجى تحديد التصنيف"),
  tags: z.string().min(1, "يرجى إدخال وسم واحد على الأقل (افصل بينها بفاصلة)"),
  thumbnail: z.string().optional().or(z.literal("")),
  isPublished: z.boolean().default(false),
});

// Event validation schema
export const EventSchema = z.object({
  title: z.string().min(3, "العنوان يجب أن يتكون من 3 أحرف على الأقل"),
  description: z.string().min(10, "الوصف يجب أن يتكون من 10 أحرف على الأقل"),
  coverImage: z.string().min(1, "يرجى إدخال رابط صورة الغلاف"),
  startDate: z.coerce.date({ message: "تاريخ البدء غير صالح" }),
  endDate: z.coerce.date({ message: "تاريخ الانتهاء غير صالح" }),
  location: z.string().min(3, "الموقع يجب أن يتكون من 3 أحرف على الأقل"),
  hostedBy: z.string().min(3, "الجهة المستضيفة يجب أن تتكون من 3 أحرف على الأقل"),
  attendeeCount: z.coerce.number().min(0, "عدد الحضور يجب أن يكون 0 أو أكثر").default(0),
  isPublished: z.boolean().default(false),
  partnerIds: z.array(z.string()).optional().default([]),
});

// GalleryItem validation schema
export const GalleryItemSchema = z.object({
  eventId: z.string().min(1, "يرجى تحديد الفعالية المرتبطة"),
  type: z.enum(["IMAGE", "VIDEO"]),
  title: z.string().min(3, "العنوان يجب أن يتكون من 3 أحرف على الأقل"),
  fileUrl: z.string().min(1, "يرجى إدخال رابط الملف"),
  thumbnail: z.string().optional().or(z.literal("")),
});

// Partner validation schema
export const PartnerSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يتكون من حرفين على الأقل"),
  logo: z.string().min(1, "يرجى إدخال رابط الشعار"),
  website: z.string().url("رابط الموقع الإلكتروني غير صالح").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

// SiteSettings validation schema
export const SiteSettingsSchema = z.object({
  siteName: z.string().min(2, "اسم الموقع يجب أن يكون حرفين على الأقل"),
  siteDescription: z.string().min(5, "الوصف يجب أن يكون 5 أحرف على الأقل"),
  siteLogo: z.string().optional().or(z.literal("")),
  favicon: z.string().optional().or(z.literal("")),
  primaryColor: z.string().optional().or(z.literal("")),
  secondaryColor: z.string().optional().or(z.literal("")),
  contactEmail: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  copyrightText: z.string().optional().or(z.literal("")),
  statsWorkshopsCount: z.coerce.number().min(0, "العداد يجب أن يكون 0 أو أكبر").default(0),
  statsStudentsCount: z.coerce.number().min(0, "العداد يجب أن يكون 0 أو أكبر").default(0),
  statsCertificatesCount: z.coerce.number().min(0, "العداد يجب أن يكون 0 أو أكبر").default(0),
  statsProjectsCount: z.coerce.number().min(0, "العداد يجب أن يكون 0 أو أكبر").default(0),
});

// SocialLink validation schema
export const SocialLinkSchema = z.object({
  platform: z.string().min(2, "المنصة يجب أن تتكون من حرفين على الأقل"),
  url: z.string().url("رابط الحساب غير صالح"),
  icon: z.string().optional().or(z.literal("")),
  isVisible: z.boolean().default(true),
});

// NavigationLink validation schema
export const NavigationLinkSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يتكون من حرفين على الأقل"),
  url: z.string().min(1, "يرجى كتابة المسار أو الرابط"),
  type: z.enum(["NAVBAR", "FOOTER"]),
  order: z.coerce.number().min(0, "الترتيب يجب أن يكون 0 أو أكبر").default(0),
  isVisible: z.boolean().default(true),
});

// SEOSettings validation schema
export const SEOSettingsSchema = z.object({
  page: z.string().min(2, "اسم الصفحة غير صالح"),
  title: z.string().min(3, "عنوان الصفحة يجب أن يتكون من 3 أحرف على الأقل"),
  description: z.string().min(5, "وصف الصفحة يجب أن يتكون من 5 أحرف على الأقل"),
  keywords: z.string().optional().default(""),
  ogImage: z.string().optional().or(z.literal("")),
});

// HeroSectionSettings validation schema
export const HeroSectionSettingsSchema = z.object({
  title: z.string().min(3, "عنوان الهيرو يجب أن يتكون من 3 أحرف على الأقل"),
  description: z.string().min(5, "وصف الهيرو يجب أن يتكون من 5 أحرف على الأقل"),
  backgroundImage: z.string().optional().or(z.literal("")),
  buttonText1: z.string().optional().or(z.literal("")),
  buttonLink1: z.string().optional().or(z.literal("")),
  buttonText2: z.string().optional().or(z.literal("")),
  buttonLink2: z.string().optional().or(z.literal("")),
});

// WhyComixDevItem validation schema
export const WhyComixDevItemSchema = z.object({
  title: z.string().min(3, "العنوان يجب أن يتكون من 3 أحرف على الأقل"),
  description: z.string().min(5, "الوصف يجب أن يتكون من 5 أحرف على الأقل"),
  icon: z.string().optional().or(z.literal("")),
  order: z.coerce.number().min(0, "الترتيب يجب أن يكون 0 أو أكبر").default(0),
});

// Testimonial validation schema
export const TestimonialSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يتكون من حرفين على الأقل"),
  role: z.string().min(2, "الوظيفة يجب أن تتكون من حرفين على الأقل"),
  image: z.string().optional().or(z.literal("")),
  content: z.string().min(5, "النص يجب أن يتكون من 5 أحرف على الأقل"),
});

// LinkHubSettings validation schema
export const LinkHubSettingsSchema = z.object({
  title: z.string().min(3, "العنوان يجب أن يتكون من 3 أحرف على الأقل"),
  description: z.string().min(5, "الوصف يجب أن يتكون من 5 أحرف على الأقل"),
  logo: z.string().optional().or(z.literal("")),
  coverImage: z.string().optional().or(z.literal("")),
  isEnabled: z.boolean().default(true),
});

// SocialPlatform validation schema
export const SocialPlatformSchema = z.object({
  platform: z.string(),
  url: z.string().optional().or(z.literal("")),
  isEnabled: z.boolean().default(false),
  displayOrder: z.coerce.number().min(0).default(0),
});

// CustomLink validation schema
export const CustomLinkSchema = z.object({
  title: z.string().min(2, "عنوان الرابط يجب أن يتكون من حرفين على الأقل"),
  url: z.string().url("يرجى إدخال رابط ويب صالح (يبدأ بـ http:// أو https://)"),
  icon: z.string().optional().or(z.literal("")),
  isEnabled: z.boolean().default(true),
  displayOrder: z.coerce.number().min(0).default(0),
});

// AboutUsSettings validation schema
export const AboutUsSettingsSchema = z.object({
  title: z.string().min(2, "العنوان يجب أن يتكون من حرفين على الأقل"),
  description: z.string().min(5, "الوصف يجب أن يتكون من 5 أحرف على الأقل"),
  mission: z.string().optional().or(z.literal("")),
  vision: z.string().optional().or(z.literal("")),
  values: z.string().optional().or(z.literal("")),
});

// TeamMember validation schema
export const TeamMemberSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يتكون من حرفين على الأقل"),
  position: z.string().min(2, "الوظيفة يجب أن تتكون من حرفين على الأقل"),
  image: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  socialLinks: z.any().optional(), // Will handle JSON
  isVisible: z.boolean().default(true),
  order: z.coerce.number().min(0).default(0),
});

// ContactFormSettings validation schema
export const ContactFormSettingsSchema = z.object({
  isFormEnabled: z.boolean().default(true),
  receiveEmails: z.boolean().default(true),
  successMessage: z.string().min(2, "رسالة النجاح يجب أن تتكون من حرفين على الأقل"),
  autoReplyMessage: z.string().optional().or(z.literal("")),
});

// ContactMessage schema (for status updates)
export const ContactMessageStatusSchema = z.object({
  status: z.enum(["NEW", "READ", "REPLIED"]),
});

// Update WorkshopSchema to include new fields
export const UpdatedWorkshopSchema = WorkshopSchema.extend({
  isFeatured: z.boolean().default(false),
  instructor: z.string().optional().or(z.literal("")),
  whatYouWillLearn: z.string().optional().or(z.literal("")),
  requiredTools: z.string().optional().or(z.literal("")),
  faq: z.string().optional().or(z.literal("")),
  agenda: z.string().optional().or(z.literal("")),
});
