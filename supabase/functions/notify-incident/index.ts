
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { reportId, studentName, incidentType, description } = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch only principal emails (modified from previous version)
    const { data: principalUsers, error: principalError } = await supabaseClient
      .from('user_profiles')
      .select('email')
      .eq('role', 'principal');

    if (principalError) throw principalError;

    const principalEmails = principalUsers.map(user => user.email);
    
    if (principalEmails.length === 0) {
      throw new Error('No principal emails found');
    }

    const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173';
    const reportUrl = `${appUrl}/admin?report=${reportId}`;

    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: 'School Incident Reports <onboarding@resend.dev>',
      to: principalEmails,
      subject: `New Incident Report - ${studentName}`,
      html: `
        <h1>New Incident Report</h1>
        <p>A new incident report has been filed:</p>
        <ul>
          <li><strong>Student:</strong> ${studentName}</li>
          <li><strong>Type:</strong> ${incidentType}</li>
          <li><strong>Description:</strong> ${description}</li>
        </ul>
        <p>
          <a href="${reportUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
            View Report
          </a>
        </p>
      `,
    });

    if (emailError) throw emailError;

    return new Response(
      JSON.stringify({ message: "Notification sent successfully" }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
