import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customer_id, order_id, method } = await req.json();

    if (!customer_id || !order_id || !method) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Hole Kundendaten
    const customer = await base44.entities.Customer.get(customer_id);
    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Hole Auftragsdaten
    const order = await base44.entities.CustomerOrder.get(order_id);
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Prüfe ob Kunde Benachrichtigung erlaubt hat
    if (method === 'whatsapp' && !customer.whatsapp_opt_in) {
      return Response.json({ error: 'Customer has not opted in for WhatsApp' }, { status: 403 });
    }

    if (method === 'mail' && !customer.mail_opt_in) {
      return Response.json({ error: 'Customer has not opted in for Email' }, { status: 403 });
    }

    // Nachrichtentext erstellen
    const message = `Hallo ${customer.name},\n\nIhr Auftrag bei Täubert Karosserie & Lack:\n\n${order.title}\nFahrzeug: ${order.vehicle_info}\nStatus: ${order.status}\n\n${order.appointment_date ? `Termin: ${order.appointment_date} ${order.appointment_time || ''}\n` : ''}\nBei Fragen kontaktieren Sie uns gerne.\n\nMit freundlichen Grüßen\nIhr Täubert Team`;

    // Benachrichtigung senden
    if (method === 'whatsapp') {
      // WhatsApp Integration (muss noch konfiguriert werden)
      // Hier würde die WhatsApp Business API Integration erfolgen
      console.log('WhatsApp an', customer.phone, ':', message);
    } else if (method === 'mail') {
      await base44.integrations.Core.SendEmail({
        to: customer.email,
        subject: `Ihr Täubert Auftrag: ${order.title}`,
        body: message.replace(/\n/g, '<br>'),
        from_name: 'Täubert Karosserie & Lack'
      });
    } else if (method === 'sms') {
      // SMS Integration (muss noch konfiguriert werden)
      console.log('SMS an', customer.phone, ':', message);
    }

    // Auftrag aktualisieren
    await base44.entities.CustomerOrder.update(order_id, {
      notification_sent: true,
      notification_method: method,
      notification_date: new Date().toISOString(),
      customer_notified: true
    });

    return Response.json({ 
      success: true, 
      message: `Benachrichtigung via ${method} gesendet`,
      customer: customer.name,
      order: order.title
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});