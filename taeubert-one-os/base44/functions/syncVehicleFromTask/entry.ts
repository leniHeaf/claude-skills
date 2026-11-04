import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const STAGE_ORDER = ['annahme', 'teile_bestellt', 'demontage', 'karosserie', 'vorbereitung', 'lackierung', 'finish', 'endkontrolle', 'uebergabe'];

const CATEGORY_TO_STAGE = {
  teile: 'teile_bestellt',
  karosserie: 'karosserie',
  vorbereitung: 'vorbereitung',
  lackierung: 'lackierung',
  finish: 'finish',
  reinigung: 'finish',
  uebergabe: 'uebergabe',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const task = body.data;

    if (!task || !task.vehicle_id) {
      return Response.json({ ok: true, skipped: true, reason: 'no vehicle' });
    }

    const vehicleId = task.vehicle_id;

    const vehicle = await base44.asServiceRole.entities.Vehicle.get(vehicleId);
    if (!vehicle) {
      return Response.json({ ok: true, skipped: true, reason: 'vehicle not found' });
    }

    const vehicleTasks = await base44.asServiceRole.entities.Task.filter({ vehicle_id: vehicleId });

    if (vehicleTasks.length === 0) {
      return Response.json({ ok: true, skipped: true, reason: 'no tasks' });
    }

    // Determine current state
    const activeTask = vehicleTasks.find(t => t.status === 'in_arbeit');
    const allDone = vehicleTasks.every(t => t.status === 'erledigt');
    const hasAssigned = vehicleTasks.some(t => t.assigned_to && t.status !== 'erledigt');
    const doneCount = vehicleTasks.filter(t => t.status === 'erledigt').length;
    const progress = Math.round((doneCount / vehicleTasks.length) * 100);

    let newStatus = vehicle.status || 'annahme';
    let newCondition = vehicle.condition || 'in_arbeit';

    if (allDone) {
      newStatus = 'uebergabe';
      newCondition = 'fertig';
    } else if (activeTask) {
      const mappedStage = CATEGORY_TO_STAGE[activeTask.category];
      if (mappedStage) {
        const currentIdx = STAGE_ORDER.indexOf(newStatus);
        const newIdx = STAGE_ORDER.indexOf(mappedStage);
        if (newIdx > currentIdx) {
          newStatus = mappedStage;
        }
      }
      newCondition = 'in_arbeit';
    } else if (hasAssigned) {
      newCondition = 'in_arbeit';
    }

    // Responsible = first active or assigned employee
    const responsibleTask = vehicleTasks.find(t => t.assigned_to && t.status !== 'erledigt');
    const responsible = responsibleTask ? responsibleTask.assigned_to : (vehicle.responsible || '');

    const updates = {};
    if (newStatus !== vehicle.status) updates.status = newStatus;
    if (newCondition !== vehicle.condition) updates.condition = newCondition;
    if (progress !== vehicle.progress) updates.progress = progress;
    if (responsible && responsible !== vehicle.responsible) updates.responsible = responsible;

    if (Object.keys(updates).length > 0) {
      await base44.asServiceRole.entities.Vehicle.update(vehicleId, updates);
    }

    return Response.json({ ok: true, vehicleId, updates, taskCount: vehicleTasks.length, doneCount, progress });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});