/**
 * Resend Email Service Utility
 * Handles sending OTP verification emails via Resend API.
 * Falls back to server console logging during development if API key is not configured.
 */

export async function sendVerificationEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #1f2937; border-radius: 16px; background-color: #0b0f19; color: #f3f4f6; text-align: right; direction: rtl;">
      
      <!-- Logo Header -->
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; padding: 12px; background: linear-gradient(135deg, #06b6d4, #8b5cf6); border-radius: 12px; box-shadow: 0 4px 10px rgba(6, 182, 212, 0.2);">
          <span style="font-size: 20px; font-weight: bold; color: #ffffff;">ComixDev</span>
        </div>
      </div>

      <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; text-align: center; margin-bottom: 10px;">تأكيد حسابك في ComixDev</h2>
      <p style="font-size: 14px; color: #9ca3af; text-align: center; margin-bottom: 30px;">Verify your ComixDev account</p>
      
      <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">مرحباً بك في منصة ComixDev،</p>
      <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">شكراً لتسجيلك معنا. يرجى إدخال رمز التحقق (OTP) التالي لتأكيد عنوان بريدك الإلكتروني والبدء في استخدام لوحة التحكم وحجز الورشات:</p>
      
      <!-- OTP Code Box -->
      <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px dashed rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
        <p style="font-size: 12px; color: #06b6d4; font-weight: bold; margin: 0 0 10px 0; letter-spacing: 1px; text-transform: uppercase;">رمز التأكيد الخاص بك</p>
        <span style="font-size: 32px; font-weight: 900; color: #06b6d4; font-family: monospace; letter-spacing: 6px; text-shadow: 0 0 8px rgba(6, 182, 212, 0.1);">${code}</span>
      </div>

      <p style="font-size: 13px; color: #ef4444; font-weight: 600; text-align: center; margin-top: 10px;">
        ⚠️ هذا الرمز صالح لمدة 10 دقائق فقط (Expires in 10 minutes).
      </p>

      <hr style="border: 0; border-top: 1px solid #1f2937; margin: 25px 0;" />
      
      <p style="font-size: 11px; text-align: center; color: #6b7280; line-height: 1.4;">
        إذا لم تكن قد طلبت هذا الكود، يرجى تجاهل هذه الرسالة.<br/>
        ComixDev &copy; ${new Date().getFullYear()} - Riyadh, Saudi Arabia
      </p>

    </div>
  `;

  // Fallback to console logging if Resend API key is missing or not configured
  if (!apiKey || apiKey === "placeholder" || apiKey.startsWith("placeholder_")) {
    console.log("\n========================================================");
    console.log(`[DEVELOPMENT EMAIL OTP LOG]`);
    console.log(`To: ${email}`);
    console.log(`Verification Code: ${code}`);
    console.log("========================================================\n");
    return { success: true, logged: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "ComixDev <onboarding@resend.dev>", // Sandbox sender for Resend
        to: email,
        subject: "Verify your ComixDev account",
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Resend API error: ${errText}`);
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error("Resend API failed, falling back to console log:", error);
    console.log("\n========================================================");
    console.log(`[FALLBACK EMAIL OTP LOG]`);
    console.log(`To: ${email}`);
    console.log(`Verification Code: ${code}`);
    console.log("========================================================\n");
    return { success: true, logged: true };
  }
}
