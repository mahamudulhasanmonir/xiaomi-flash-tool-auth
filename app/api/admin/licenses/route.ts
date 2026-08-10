import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_SECRET = 'xiaomi123!';

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json();

    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const licenses = await prisma.license.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, licenses });
  } catch (error: any) {
    console.error('Fetch licenses error:', error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
