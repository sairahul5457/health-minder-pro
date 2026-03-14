import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caregiverEmail, caregiverName, patientName, medicationName, missedTime, alertType } = await req.json();

    if (!caregiverEmail) {
      return new Response(
        JSON.stringify({ error: "Caregiver email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not set — logging alert instead of sending email");
      console.log(`CAREGIVER ALERT: ${patientName} missed ${medicationName} at ${missedTime}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Alert logged (email service not configured yet)",
          alert: { caregiverEmail, patientName, medicationName, missedTime, alertType }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "MedRemind <onboarding@resend.dev>",
        to: [caregiverEmail],
        subject: `🚨 MedRemind Alert: ${patientName} missed ${medicationName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px;">
            <h2 style="color: #e74c3c;">🚨 Medication Alert</h2>
            <p>Dear ${caregiverName || "Caregiver"},</p>
            <p><strong>${patientName}</strong> has missed their medication:</p>
            <div style="background: #f8f9fa; border-left: 4px solid #e74c3c; padding: 16px; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 0;"><strong>💊 Medication:</strong> ${medicationName}</p>
              <p style="margin: 8px 0 0;"><strong>⏰ Scheduled Time:</strong> ${missedTime}</p>
              <p style="margin: 8px 0 0;"><strong>📋 Alert Type:</strong> ${alertType || "Missed after 4 snoozes"}</p>
            </div>
            <p>Please check on them as soon as possible.</p>
            <p style="color: #888; font-size: 12px;">— MedRemind Smart Healthcare App</p>
          </div>
        `,
      }),
    });

    const emailData = await emailRes.json();
    
    return new Response(
      JSON.stringify({ success: true, data: emailData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
