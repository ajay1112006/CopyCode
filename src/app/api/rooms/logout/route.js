import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { roomName } = await req.json();
    const safeRoomName = roomName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    const response = NextResponse.json({ message: 'Logged out' });
    
    response.cookies.set({
      name: `room_token_${safeRoomName}`,
      value: '',
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
