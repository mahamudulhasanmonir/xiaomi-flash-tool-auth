import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// In a real app, this should be an environment variable.
const ADMIN_SECRET = 'xiaomi123!';

export async function POST(req: NextRequest) {
  try {
    const { secret, prefix = 'XFT' } = await req.json();

    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a random 16-character license key
    const randomString = Math.random().toString(36).substring(2, 10).toUpperCase() + 
                         Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const key = `${prefix}-${randomString.substring(0, 4)}-${randomString.substring(4, 8)}-${randomString.substring(8, 12)}`;

    const license = await prisma.license.create({
      data: { key },
    });

    return NextResponse.json({ success: true, license });
  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
