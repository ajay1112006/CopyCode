import { NextResponse } from 'next/server';
import { DataService } from '@/lib/storage';

export async function POST(req) {
  try {
    const { name, password } = await req.json();

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Please provide room name and password' },
        { status: 400 }
      );
    }

    try {
      const room = await DataService.createRoom({ name, password });
      return NextResponse.json(
        { message: 'Room created successfully', room: { name: room.name } },
        { status: 201 }
      );
    } catch (error) {
      if (error.message === 'Room name already exists') {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: `Failed to create room: ${error.message}` },
      { status: 500 }
    );
  }
}
