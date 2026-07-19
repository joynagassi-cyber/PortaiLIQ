export async function sendBrevoEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn("Brevo API key not configured");
      return false;
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "IntakeFlow",
          email: process.env.BREVO_SENDER_EMAIL || "noreply@intakeflow.app",
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Brevo send error:", error);
    return false;
  }
}
