import React from "react";
import type { Metadata } from "next";
import { getSEOSettings, getAboutUsSettings, getTeamMembers } from "@/lib/settings";
import { Eye, Target, Sparkles, Award, Shield, CheckCircle2, Code, BrainCircuit, Database, Server, Users } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOSettings("about");
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: seo.ogImage ? { images: [seo.ogImage] } : undefined,
  };
}

export default async function AboutPage() {
  const about = await getAboutUsSettings();
  const teamMembers = await getTeamMembers();

  return (
    <div className="w-full py-12 md:py-20 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl space-y-16">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 text-neon-cyan text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            تعرّف علينا عن قرب
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">
            {about.title}
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            {about.description}
          </p>
        </div>

        {/* About Us Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-950/20 p-6 md:p-8 rounded-2xl border border-white/5">
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-white">ريادة التدريب التقني</h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              تأسست ComixDev كشركة تقنية متخصصة تسعى لسد الفجوة بين التعليم الأكاديمي والاحتياجات الفعلية لسوق العمل. نحن نؤمن بأن التقنيات الحديثة، وتحديداً الذكاء الاصطناعي، ليست مجرد أدوات بل هي لغة المستقبل التي يجب على كل مطور ومبرمج التحدث بها بطلاقة.
            </p>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              عبر ورش عمل تفاعلية حية، ودورات مكثفة، ومكتبة من الموارد الجاهزة، قمنا بتمكين مئات الطلاب والمطورين العرب من بدء مسيراتهم المهنية والمشاركة الفعالة في المشاريع العالمية.
            </p>
          </div>
          
          {/* Key pillars list */}
          <div className="space-y-4 border-r border-white/5 pr-0 md:pr-8">
            <h3 className="text-lg font-semibold text-white">قيمنا الأساسية</h3>
            <div className="space-y-3">
              {about.values && about.values.split(",").map((value, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-neon-cyan shrink-0" />
                  <span className="text-sm text-gray-300">{value.trim()}</span>
                </div>
              ))}
              {!about.values && (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-neon-cyan shrink-0" />
                    <span className="text-sm text-gray-300">التعلم بالتطبيق العملي المباشر</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-neon-cyan shrink-0" />
                    <span className="text-sm text-gray-300">مواكبة وتغطية أحدث التقنيات فور صدورها</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-neon-cyan shrink-0" />
                    <span className="text-sm text-gray-300">تقديم شهادات إتمام موثقة وحقيقية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-neon-cyan shrink-0" />
                    <span className="text-sm text-gray-300">بناء مجتمع برمجي تفاعلي وداعم للمطورين</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Vision card */}
          <div className="glass p-8 rounded-xl space-y-4 hover:border-neon-cyan/20 transition-all duration-300">
            <div className="p-3 rounded-lg bg-neon-cyan/10 text-neon-cyan w-fit">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">رؤية ComixDev</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              {about.vision || "أن نكون الحاضنة والمنصة البرمجية والتعليمية الأهم في العالم العربي لتخريج وتأهيل العقول التقنية المبدعة قادرة على ابتكار حلول ذكاء اصطناعي تنافسية ومشاريع متطورة عالمياً."}
            </p>
          </div>

          {/* Mission card */}
          <div className="glass p-8 rounded-xl space-y-4 hover:border-neon-purple/20 transition-all duration-300">
            <div className="p-3 rounded-lg bg-neon-purple/10 text-neon-purple w-fit">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">رسالتنا</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              {about.mission || "توفير محتوى تعليمي تطبيقي عالي الجودة يركز على المهارات الأساسية، وتسهيل الوصول للأدوات والنماذج الحديثة للـ AI، لمساعدة كل مطور على تسريع مساره المهني وزيادة إنتاجيته."}
            </p>
          </div>

        </div>

        {/* Team Members */}
        {teamMembers.filter(m => m.isVisible).length > 0 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-neon-purple/20 bg-neon-purple/5 text-neon-purple text-xs font-semibold">
                <Users className="w-3.5 h-3.5" />
                فريقنا
              </div>
              <h2 className="text-xl md:text-3xl font-bold text-white">تعرف على أعضاء الفريق</h2>
              <p className="text-gray-400 text-sm">الفريق المتفاني الذي يقف خلف كل ورشة وكل برومبت.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.filter(m => m.isVisible).map(member => (
                <div key={member.id} className="glass p-6 rounded-xl space-y-4 hover:border-neon-cyan/20 transition-all">
                  <div className="flex items-center gap-4">
                    {member.image && (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-16 h-16 rounded-full object-cover border border-white/10"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white">{member.name}</h3>
                      <p className="text-sm text-neon-cyan">{member.position}</p>
                    </div>
                  </div>
                  {member.description && (
                    <p className="text-sm text-gray-400 leading-relaxed">{member.description}</p>
                  )}
                  {member.socialLinks && typeof member.socialLinks === "object" && (
                    <div className="flex items-center gap-2 mt-2">
                      {/* Social links could go here */}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expertise Section */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-3xl font-bold text-white">خبراتنا التقنية ومجالات تركيزنا</h2>
            <p className="text-gray-400 text-sm">نركز طاقاتنا وخبراتنا لتعليمك وتأهيلك في 4 مجالات رئيسية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="glass p-6 rounded-xl space-y-3 hover:border-neon-cyan/20 transition-colors">
              <div className="text-neon-cyan">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">الذكاء الاصطناعي</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                خبرة متراكمة في صياغة الأوامر (Prompt Engineering) وتطوير وتكامل نماذج اللغات الكبيرة (LLMs Integration) مع قواعد البيانات.
              </p>
            </div>

            <div className="glass p-6 rounded-xl space-y-3 hover:border-neon-purple/20 transition-colors">
              <div className="text-neon-purple">
                <Code className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">تطوير الويب الحديث</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                بناء هياكل واجهات سريعة وتفاعلية باستخدام Next.js 16، الـ React 19، لغة TypeScript وأدوات التنسيق الأكثر حداثة مثل Tailwind.
              </p>
            </div>

            <div className="glass p-6 rounded-xl space-y-3 hover:border-neon-cyan/20 transition-colors">
              <div className="text-neon-cyan">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">إدارة قواعد البيانات</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                بناء وتطوير قواعد البيانات السحابية السريعة مثل Neon PostgreSQL وإدارتها بالكامل وتطبيق العلاقات وربطها عبر Prisma.
              </p>
            </div>

            <div className="glass p-6 rounded-xl space-y-3 hover:border-neon-purple/20 transition-colors">
              <div className="text-neon-purple">
                <Server className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">خوادم وحوسبة سحابية</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                تأمين الاتصالات السحابية وتوزيع الحزم البرمجية وإعداد البنية التحتية للخوادم السحابية وإطلاق المشاريع بسلاسة.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
