import { NextResponse } from 'next/server';
import { DataService } from '@/lib/storage';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { name, password } = await req.json();

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Please provide room name and password' },
        { status: 400 }
      );
    }

    const room = await DataService.findRoomByName(name);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    const isMatch = await room.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create JWT
    const token = jwt.sign(
      { roomId: room._id, roomName: room.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { message: 'Access granted', roomName: room.name },
      { status: 200 }
    );

    // Sanitize cookie name: only alphanumeric and underscores
    const safeRoomName = room.name.replace(/[^a-zA-Z0-9]/g, '_');

    response.cookies.set({
      name: `room_token_${safeRoomName}`,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Access room error:', error);
    return NextResponse.json(
      { error: `Failed to access room: ${error.message}` },
      { status: 500 }
    );
  }
}
