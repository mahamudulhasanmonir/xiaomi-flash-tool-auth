import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_SECRET = 'xiaomi123!';

export async function POST(req: NextRequest) {
  try {
    const { secret, id, isBanned } = await req.json();

    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!id || typeof isBanned !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    const updatedLicense = await prisma.license.update({
      where: { id },
      data: { isBanned },
    });

    return NextResponse.json({ success: true, license: updatedLicense });
  } catch (error: any) {
    console.error('Ban error:', error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
