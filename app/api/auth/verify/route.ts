import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { key, hwid } = await req.json();

    if (!key || !hwid) {
      return NextResponse.json({ success: false, error: 'Missing key or hwid' }, { status: 400 });
    }

    const license = await prisma.license.findUnique({
      where: { key },
    });

    if (!license) {
      return NextResponse.json({ success: false, error: 'Invalid license key' }, { status: 404 });
    }

    if (license.isBanned) {
      return NextResponse.json({ success: false, error: 'License is banned' }, { status: 403 });
    }

    // Bind HWID if unused
    if (!license.hwid) {
      await prisma.license.update({
        where: { id: license.id },
        data: { hwid },
      });
      return NextResponse.json({ success: true, message: 'License verified and bound to this device' });
    }

    // Check if HWID matches
    if (license.hwid !== hwid) {
      return NextResponse.json({ success: false, error: 'License is already bound to another device' }, { status: 403 });
    }

    return NextResponse.json({ success: true, message: 'License verified' });
  } catch (error: any) {
    console.error('Verify error:', error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
