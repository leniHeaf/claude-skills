import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const RECIPIENT = 'hello@taeubert-karosserie-lack.de';

const URGENCY_LABELS = {
  niedrig: 'Niedrig',
  normal: 'Normal',
  dringend: 'Dringend',
  sofort: 'SOFORT',
};

function utf8ToBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildEmailBody(pr) {
  const lines = [
    'Neue Materialbestellung wurde im System bestätigt.',
    '',
    '─────────────────────────────',
    `Material:      ${pr.material_name || '—'}`,
    `Menge:         ${pr.quantity || '—'} ${pr.unit || 'Stk'}`,
    `Dringlichkeit: ${URGENCY_LABELS[pr.urgency] || pr.urgency || '—'}`,
  ];
  if (pr.supplier) lines.push(`Lieferant:     ${pr.supplier}`);
  if (pr.vehicle_info) lines.push(`Fahrzeug:      ${pr.vehicle_info}`);
  if (pr.requested_by) lines.push(`Angefordert:   ${pr.requested_by}`);
  if (pr.price_total != null) lines.push(`Geschätzter Preis: ${pr.price_total} €`);
  if (pr.notes) {
    lines.push('', 'Notizen:', pr.notes);
  }
  lines.push(
    '',
    '─────────────────────────────',
    'Diese E-Mail wurde automatisch vom Täubert System generiert.',
  );
  return lines.join('\n');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Entity automation payload: { event, data, old_data, changed_fields }
    const pr = body.data;
    if (!pr || pr.status !== 'bestellt') {
      return Response.json({ skipped: true, reason: 'not a bestellt event' });
    }

    const subject = `Materialbestellung: ${pr.material_name || 'Material'} (${pr.quantity || ''} ${pr.unit || 'Stk'})`;
    const emailBody = buildEmailBody(pr);

    // Send via built-in SendEmail integration
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: RECIPIENT,
      from_name: 'Täubert System',
      subject,
      body: emailBody,
    });

    return Response.json({ success: true, recipient: RECIPIENT });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});