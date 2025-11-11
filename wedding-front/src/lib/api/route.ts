import { NextRequest, NextResponse } from 'next/server';
import { rsvpApi } from '@/lib/api/rsvp';

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const formData = await request.formData();
    
    const data = {
      status: formData.get('status') as 'CONFIRMED' | 'DECLINED' | 'PENDING',
      numberOfGuests: parseInt(formData.get('numberOfGuests') as string, 10) || 1,
      message: formData.get('message') as string,
      dietaryRestrictions: formData.get('dietaryRestrictions') as string,
    };

    await rsvpApi.respond(params.token, data);

    return NextResponse.redirect(
      new URL(`/rsvp/${params.token}/merci`, request.url)
    );
  } catch (error) {
    console.error('Error handling RSVP response:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement de votre réponse' },
      { status: 500 }
    );
  }
} 