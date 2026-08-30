import { NextResponse } from 'next/server';
import { prisma } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activeExam = await prisma.examConfig.findFirst({
      where: { isActive: true },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            questions: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!activeExam) {
      return NextResponse.json({ error: 'No active exam configuration found' }, { status: 404 });
    }

    return NextResponse.json(activeExam);
  } catch (error) {
    console.error('Error fetching exam config:', error);
    return NextResponse.json({ error: 'Failed to fetch exam config' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.passkey || !body.duration || !Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Invalid payload. Required: title, passkey, duration, sections array' },
        { status: 400 }
      );
    }

    // Set all previous active configs to isActive: false
    await prisma.examConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    const examId = crypto.randomUUID();

    // Create new active ExamConfig with sections and questions
    const createdExam = await prisma.examConfig.create({
      data: {
        id: examId,
        title: body.title,
        duration: Number(body.duration),
        passkey: body.passkey.trim().toUpperCase(),
        isActive: true,
        sections: {
          create: body.sections.map((sec: { name: string; questions?: { question: string; options: string[]; correctIndex: number }[] }, secIdx: number) => ({
            id: crypto.randomUUID(),
            name: sec.name,
            sortOrder: secIdx,
            questions: {
              create: (sec.questions || []).map((q: { question: string; options: string[]; correctIndex: number }, qIdx: number) => ({
                id: crypto.randomUUID(),
                question: q.question,
                options: JSON.stringify(q.options || []),
                correctIndex: q.correctIndex ?? 0,
                sortOrder: qIdx,
              })),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            questions: true,
          },
        },
      },
    });

    const totalQuestions = createdExam.sections.reduce(
      (acc, sec) => acc + sec.questions.length,
      0
    );

    return NextResponse.json(
      {
        message: 'Exam configuration uploaded and activated successfully',
        examId: createdExam.id,
        title: createdExam.title,
        passkey: createdExam.passkey,
        duration: createdExam.duration,
        sectionCount: createdExam.sections.length,
        questionCount: totalQuestions,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating exam config:', error);
    return NextResponse.json({ error: 'Failed to create exam config' }, { status: 500 });
  }
}
