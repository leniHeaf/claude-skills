import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, vin, partNumber, vehicleData, calculation } = await req.json();

    const DAT_API_KEY = Deno.env.get("DAT_API_KEY");
    const DAT_API_URL = Deno.env.get("DAT_API_URL") || "https://api.dat.de/v1";

    if (!DAT_API_KEY) {
      return Response.json({ error: 'DAT API key not configured' }, { status: 500 });
    }

    // DAT API Teilekatalog
    if (action === 'lookupParts') {
      const response = await fetch(`${DAT_API_URL}/parts/catalog`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DAT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vin: vin,
          partNumber: partNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`DAT API error: ${response.status}`);
      }

      const data = await response.json();
      return Response.json({ parts: data.parts || [] });
    }

    // DAT API Fahrzeugdaten validieren
    if (action === 'validateVehicle') {
      const response = await fetch(`${DAT_API_URL}/vehicles/decode`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DAT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vin: vehicleData?.vin,
          licensePlate: vehicleData?.license_plate,
          make: vehicleData?.make,
          model: vehicleData?.model,
        }),
      });

      if (!response.ok) {
        throw new Error(`DAT API error: ${response.status}`);
      }

      const data = await response.json();
      return Response.json({ 
        validated: true, 
        vehicle: data.vehicle,
        equipment: data.equipment || [],
        engineType: data.engineType 
      });
    }

    // DAT API Kalkulation an DAT übermitteln (Schnittstelle)
    if (action === 'submitCalculation') {
      const calc = calculation || {};
      const response = await fetch(`${DAT_API_URL}/estimates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DAT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calc),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`DAT API error: ${response.status} ${detail}`);
      }

      const data = await response.json().catch(() => ({}));
      return Response.json({
        success: true,
        datEstimateId: data.estimateId || data.id || null,
        datReference: data.reference || data.datReference || null,
        raw: data,
      });
    }

    // DAT API Teilepreise abrufen
    if (action === 'getPartsPricing') {
      const partNumbers = vehicleData?.parts || [];
      const pricingRequests = partNumbers.map(pn => 
        fetch(`${DAT_API_URL}/parts/pricing?partNumber=${pn}`, {
          headers: {
            'Authorization': `Bearer ${DAT_API_KEY}`,
          },
        }).then(r => r.json())
      );

      const pricingResults = await Promise.all(pricingRequests);
      const parts = pricingResults.map((r, i) => ({
        partNumber: partNumbers[i],
        price: r.price || 0,
        supplier: r.supplier,
        availability: r.availability,
      }));

      return Response.json({ parts });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});