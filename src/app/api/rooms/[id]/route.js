import { NextResponse } from 'next/server';
import { DataService } from '@/lib/storage';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

async function verifyRoomAccess(roomName) {
  const cookieStore = await cookies();
  const safeRoomName = roomName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
  const cookieName = `room_token_${safeRoomName}`;
  const token = cookieStore.get(cookieName)?.value;

  if (!token) {
    console.error(`No token found for cookie: ${cookieName}`);
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.roomName.toLowerCase() !== roomName.toLowerCase()) {
      console.error(`Token room name mismatch: ${decoded.roomName} !== ${roomName}`);
      return null;
    }
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
}

export async function GET(req, { params }) {
  const { id: roomName } = await params;

  try {
    const decoded = await verifyRoomAccess(roomName);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const room = await DataService.findRoomByName(roomName);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ pages: room.pages });
  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const { id: roomName } = await params;

  try {
    const decoded = await verifyRoomAccess(roomName);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pages } = await req.json();
    
    const room = await DataService.updateRoomPages(roomName, pages);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Room updated', updatedAt: room.lastModified });
  } catch (error) {
    console.error('Update room error:', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}
