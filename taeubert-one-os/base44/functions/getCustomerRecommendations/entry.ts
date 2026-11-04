import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customer_id } = await req.json();

    if (!customer_id) {
      return Response.json({ error: 'customer_id required' }, { status: 400 });
    }

    // Fetch customer data
    const customers = await base44.entities.Customer.filter({ id: customer_id });
    if (customers.length === 0) {
      return Response.json({ error: 'Customer not found' }, { status: 404 });
    }
    const customer = customers[0];

    // Fetch customer vehicles
    const vehicles = await base44.entities.Vehicle.filter({ customer_name: customer.name });
    
    // Fetch customer orders
    const orders = await base44.entities.CustomerOrder.filter({ customer_id });

    const recommendations = [];

    // 1. Inactivity Detection (8+ months)
    const lastOrder = orders.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))[0];
    if (lastOrder) {
      const monthsSinceLastOrder = (new Date().getTime() - new Date(lastOrder.created_date).getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsSinceLastOrder > 8) {
        recommendations.push({
          type: "reactivation",
          priority: "high",
          title: "Kunde reaktivieren",
          description: `Seit ${Math.round(monthsSinceLastOrder)} Monaten kein Auftrag`,
          action: "Persönliche Kontaktaufnahme empfohlen",
          icon: "🔄"
        });
      }
    }

    // 2. Seasonal Recommendations
    const currentMonth = new Date().getMonth() + 1; // 1-12
    
    if (currentMonth >= 9 && currentMonth <= 11) {
      recommendations.push({
        type: "seasonal",
        priority: "medium",
        title: "Reifenwechsel anbieten",
        description: "Winter steht bevor",
        action: "Termin für Reifenwechsel vorschlagen",
        icon: "❄️"
      });
    }
    
    if (currentMonth >= 3 && currentMonth <= 5) {
      recommendations.push({
        type: "seasonal",
        priority: "medium",
        title: "Frühjahrsaufbereitung",
        description: "Ideale Zeit für Aufbereitung",
        action: "Aufbereitungspaket anbieten",
        icon: "🌸"
      });
    }

    // 3. Vehicle-based recommendations
    vehicles.forEach(v => {
      // High-end vehicles = premium services
      const premiumMakes = ["porsche", "ferrari", "lamborghini", "mclaren", "bentley", "aston martin"];
      if (premiumMakes.includes(v.make?.toLowerCase())) {
        recommendations.push({
          type: "premium",
          priority: "high",
          title: "Premium-Service anbieten",
          description: `${v.make} ${v.model} - Premium-Kunde`,
          action: "Keramikversiegelung oder Detailing anbieten",
          icon: "⭐"
        });
      }

      // Insurance vehicles = thorough documentation
      if (v.insurance) {
        recommendations.push({
          type: "insurance",
          priority: "medium",
          title: "Versicherungsdokumentation",
          description: "Versicherungsfall dokumentiert",
          action: "Vorher/Nachher-Fotos und detaillierte Rechnung",
          icon: "📋"
        });
      }

      // Old vehicles = restoration potential
      if (v.vin && v.vin.length > 10) {
        const vinYear = parseInt(v.vin.charAt(9), 10);
        if (!isNaN(vinYear) && vinYear < 10) { // Older than 2010
          recommendations.push({
            type: "restoration",
            priority: "low",
            title: "Oldtimer-Potenzial",
            description: "Älteres Fahrzeug - Restaurierung möglich",
            action: "Spezialberatung anbieten",
            icon: "🏛️"
          });
        }
      }
    });

    // 4. Behavior-based recommendations
    if (customer.behavior_traits?.includes("detailverliebt")) {
      recommendations.push({
        type: "behavior",
        priority: "high",
        title: "Detail-Fotos senden",
        description: "Kunde ist detailverliebt",
        action: "Vorher/Nachher-Bilder mit Makrodetails",
        icon: "📸"
      });
    }

    if (customer.behavior_traits?.includes("emotional")) {
      recommendations.push({
        type: "behavior",
        priority: "medium",
        title: "Emotionale Updates",
        description: "Kunde reagiert auf emotionale Kommunikation",
        action: "Persönliche Videos und Stories senden",
        icon: "❤️"
      });
    }

    if (customer.vip_status) {
      recommendations.push({
        type: "vip",
        priority: "high",
        title: "VIP-Service aktivieren",
        description: "VIP-Kunde",
        action: "Priorisierte Abwicklung + Concierge",
        icon: "👑"
      });
    }

    // 5. Order history patterns
    const completedOrders = orders.filter(o => o.status === "abgeschlossen");
    if (completedOrders.length >= 3) {
      recommendations.push({
        type: "loyalty",
        priority: "medium",
        title: "Stammkunden-Bonus",
        description: `${completedOrders.length} abgeschlossene Aufträge`,
        action: "Treuerabatt oder exklusives Angebot",
        icon: "🎁"
      });
    }

    // 6. Service contract opportunities
    if (!customer.service_contract && orders.length > 2) {
      recommendations.push({
        type: "upsell",
        priority: "medium",
        title: "Service-Vertrag anbieten",
        description: "Mehrere Aufträge ohne Vertrag",
        action: "Premium-Servicepaket vorstellen",
        icon: "📄"
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return Response.json({
      customer: {
        name: customer.name,
        type: customer.customer_type,
        vip: customer.vip_status,
        lifetime_value: customer.lifetime_value || 0
      },
      recommendations,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});