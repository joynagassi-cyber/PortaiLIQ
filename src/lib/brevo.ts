export interface EmailOptions {
  to: string
  toName?: string
  subject: string
  htmlContent: string
}

export interface WelcomeEmailOptions {
  to: string
  toName: string
  portalName: string
  freelancerName: string
  portalUrl: string
}

export interface SubmissionConfirmationOptions {
  to: string
  toName: string
  portalName: string
}

export async function sendBrevoEmail(options: EmailOptions): Promise<boolean> {
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
        to: [{ 
          email: options.to,
          name: options.toName || undefined,
        }],
        subject: options.subject,
        htmlContent: options.htmlContent,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Brevo send error:", error);
    return false;
  }
}

export async function sendWelcomeEmail(options: WelcomeEmailOptions): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bienvenue sur ${options.portalName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Bienvenue !</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Bonjour ${options.toName},</p>
        
        <p>${options.freelancerName} vous invite à compléter le portail <strong>${options.portalName}</strong>.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${options.portalUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 6px; 
                    font-weight: bold;
                    display: inline-block;">
            Accéder au portail
          </a>
        </div>
        
        <p>Ce lien vous permettra de :</p>
        <ul>
          <li>Voir les informations demandées</li>
          <li>Télécharger les fichiers nécessaires</li>
          <li>Compléter le formulaire en toute sécurité</li>
        </ul>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Si vous avez des questions, n'hésitez pas à contacter ${options.freelancerName}.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendBrevoEmail({
    to: options.to,
    toName: options.toName,
    subject: `Bienvenue sur le portail ${options.portalName}`,
    htmlContent: htmlContent,
  });
}

export async function sendSubmissionConfirmation(options: SubmissionConfirmationOptions): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmation de soumission</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">✓ Soumission confirmée</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Merci ${options.toName} !</p>
        
        <p>Votre soumission pour le portail <strong>${options.portalName}</strong> a été enregistrée avec succès.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #28a745;">✅ Ce qui se passe ensuite :</h3>
          <ul style="margin-bottom: 0;">
            <li>Le freelance va examiner vos informations</li>
            <li>Vous serez contacté(e) si des précisions sont nécessaires</li>
            <li>Vous pourrez suivre l'avancement sur le portail</li>
          </ul>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          Vous pouvez consulter le statut de votre soumission à tout moment en vous rendant sur le portail.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendBrevoEmail({
    to: options.to,
    toName: options.toName,
    subject: `Confirmation de soumission - ${options.portalName}`,
    htmlContent: htmlContent,
  });
}
