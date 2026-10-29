import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { vehicle_id, type } = await req.json();
    // type: "fertig" | "bewertung" | "erinnerung"

    if (!vehicle_id || !type) {
      return Response.json({ error: 'Missing vehicle_id or type' }, { status: 400 });
    }

    const vehicles = await base44.entities.Vehicle.filter({ id: vehicle_id });
    const vehicle = vehicles[0];
    if (!vehicle) return Response.json({ error: 'Vehicle not found' }, { status: 404 });

    const customerName = vehicle.customer_name;
    const vehicleInfo = `${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`;

    // Try to find customer email from CRM
    let customerEmail = null;
    if (customerName) {
      const customers = await base44.entities.Customer.filter({ name: customerName });
      if (customers.length > 0 && customers[0].email) {
        customerEmail = customers[0].email;
      }
    }

    if (!customerEmail) {
      return Response.json({ error: 'Keine E-Mail-Adresse für diesen Kunden gefunden. Bitte im CRM hinterlegen.' }, { status: 404 });
    }

    let subject = '';
    let body = '';

    if (type === 'fertig') {
      subject = `Ihr Fahrzeug ist fertig – ${vehicleInfo}`;
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222;">
          <div style="background: #000; padding: 24px; text-align: center;">
            <h1 style="color: #fff; font-size: 22px; letter-spacing: 4px; margin: 0;">TÄUBERT</h1>
            <p style="color: #aaa; font-size: 11px; letter-spacing: 2px; margin: 6px 0 0;">KAROSSERIE & LACK</p>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 20px; margin-bottom: 8px;">Ihr Fahrzeug ist fertig! ✅</h2>
            <p style="color: #555;">Sehr geehrte/r ${customerName},</p>
            <p style="color: #555; line-height: 1.6;">wir freuen uns, Ihnen mitteilen zu können, dass Ihr Fahrzeug <strong>${vehicleInfo}</strong> fertiggestellt wurde und zur Abholung bereitsteht.</p>
            <div style="background: #f5f5f5; border-left: 3px solid #000; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; font-weight: bold;">Fahrzeug: ${vehicleInfo}</p>
              <p style="margin: 4px 0 0; color: #555;">Status: Fertiggestellt ✓</p>
            </div>
            <p style="color: #555; line-height: 1.6;">Bitte vereinbaren Sie einen Abholtermin oder kontaktieren Sie uns, wenn Sie Fragen haben.</p>
            <p style="color: #555; margin-top: 32px;">Mit freundlichen Grüßen<br><strong>Ihr Täubert Team</strong></p>
          </div>
          <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 11px; color: #aaa;">
            Täubert Karosserie & Lack
          </div>
        </div>
      `;
    } else if (type === 'bewertung') {
      subject = `Wie war Ihre Erfahrung? – ${vehicleInfo}`;
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222;">
          <div style="background: #000; padding: 24px; text-align: center;">
            <h1 style="color: #fff; font-size: 22px; letter-spacing: 4px; margin: 0;">TÄUBERT</h1>
            <p style="color: #aaa; font-size: 11px; letter-spacing: 2px; margin: 6px 0 0;">KAROSSERIE & LACK</p>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 20px; margin-bottom: 8px;">Wie zufrieden sind Sie? ⭐</h2>
            <p style="color: #555;">Sehr geehrte/r ${customerName},</p>
            <p style="color: #555; line-height: 1.6;">wir hoffen, dass Sie mit der Arbeit an Ihrem Fahrzeug <strong>${vehicleInfo}</strong> vollauf zufrieden sind.</p>
            <p style="color: #555; line-height: 1.6;">Ihre Meinung ist uns sehr wichtig! Wenn Sie einen Moment Zeit haben, würden wir uns sehr über eine kurze Bewertung bei Google freuen – das hilft uns und anderen Kunden.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://g.page/r/review" style="background: #000; color: #fff; padding: 14px 32px; text-decoration: none; font-weight: bold; letter-spacing: 2px; font-size: 13px;">JETZT BEWERTEN</a>
            </div>
            <p style="color: #555; margin-top: 32px;">Herzlichen Dank und bis zum nächsten Mal!<br><strong>Ihr Täubert Team</strong></p>
          </div>
          <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 11px; color: #aaa;">
            Täubert Karosserie & Lack
          </div>
        </div>
      `;
    } else if (type === 'erinnerung') {
      const termin = vehicle.estimated_completion
        ? new Date(vehicle.estimated_completion).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })
        : 'in Kürze';
      subject = `Erinnerung: Abholtermin ${vehicleInfo}`;
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222;">
          <div style="background: #000; padding: 24px; text-align: center;">
            <h1 style="color: #fff; font-size: 22px; letter-spacing: 4px; margin: 0;">TÄUBERT</h1>
            <p style="color: #aaa; font-size: 11px; letter-spacing: 2px; margin: 6px 0 0;">KAROSSERIE & LACK</p>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 20px; margin-bottom: 8px;">Erinnerung: Ihr Abholtermin 🗓</h2>
            <p style="color: #555;">Sehr geehrte/r ${customerName},</p>
            <p style="color: #555; line-height: 1.6;">wir möchten Sie daran erinnern, dass Ihr Fahrzeug <strong>${vehicleInfo}</strong> voraussichtlich <strong>${termin}</strong> zur Abholung bereitsteht.</p>
            <div style="background: #f5f5f5; border-left: 3px solid #000; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; font-weight: bold;">📅 Abholtermin: ${termin}</p>
              <p style="margin: 4px 0 0; color: #555;">Fahrzeug: ${vehicleInfo}</p>
            </div>
            <p style="color: #555; line-height: 1.6;">Falls Sie den Termin nicht einhalten können, melden Sie sich bitte rechtzeitig bei uns.</p>
            <p style="color: #555; margin-top: 32px;">Wir freuen uns auf Sie!<br><strong>Ihr Täubert Team</strong></p>
          </div>
          <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 11px; color: #aaa;">
            Täubert Karosserie & Lack
          </div>
        </div>
      `;
    } else {
      return Response.json({ error: 'Unknown type' }, { status: 400 });
    }

    await base44.integrations.Core.SendEmail({
      to: customerEmail,
      subject,
      body,
      from_name: 'Täubert Karosserie & Lack'
    });

    return Response.json({ success: true, sent_to: customerEmail });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});