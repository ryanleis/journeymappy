import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Types mirrored from the UI
export type Activity = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
};

export type TimelinePayload = {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  activities: Activity[];
};

export async function GET() {
  const timelines = await prisma.timeline.findMany({
    include: { activities: true },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(timelines);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as TimelinePayload;
  const created = await prisma.timeline.create({
    data: {
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
      activities: {
        create: body.activities.map(a => ({
          name: a.name,
          description: a.description,
          startDate: a.startDate,
          endDate: a.endDate,
          status: a.status,
        })),
      },
    },
    include: { activities: true },
  });
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as TimelinePayload;
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const updated = await prisma.$transaction(async (tx) => {
    // Update base fields
    await tx.timeline.update({
      where: { id: body.id },
      data: { name: body.name, startDate: body.startDate, endDate: body.endDate },
    });

    // Replace activities snapshot
    await tx.activity.deleteMany({ where: { timelineId: body.id } });
    await tx.activity.createMany({
      data: body.activities.map(a => ({
        name: a.name,
        description: a.description,
        startDate: a.startDate,
        endDate: a.endDate,
        status: a.status,
        timelineId: body.id!,
      })),
    });

    return tx.timeline.findUnique({ where: { id: body.id }, include: { activities: true } });
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.timeline.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
