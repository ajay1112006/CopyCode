import fs from 'fs';
import path from 'path';
import Room from '@/models/Room';
import dbConnect from './db';
import bcrypt from 'bcryptjs';

const DATA_FILE = path.join(process.cwd(), 'data', 'rooms.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

export async function getRooms() {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

export async function saveRooms(rooms) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(rooms, null, 2));
}

export const DataService = {
  async createRoom({ name, password }) {
    try {
      await dbConnect();
      if (!global.mongoose.isMock) {
        return await Room.create({ name, password, pages: [{ title: 'Main', content: '' }] });
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
      console.log('Using JSON fallback for creation');
    }

    // JSON Fallback
    const rooms = await getRooms();
    if (rooms.find(r => r.name === name.toLowerCase())) {
      throw new Error('Room name already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newRoom = {
      _id: Date.now().toString(),
      name: name.toLowerCase(),
      password: hashedPassword,
      pages: [{ title: 'Main', content: '' }],
      createdAt: new Date(),
      lastModified: new Date()
    };

    rooms.push(newRoom);
    await saveRooms(rooms);
    return newRoom;
  },

  async findRoomByName(name) {
    try {
      await dbConnect();
      if (!global.mongoose.isMock) {
        return await Room.findOne({ name: name.toLowerCase() });
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
      console.log('Using JSON fallback for lookup');
    }

    const rooms = await getRooms();
    let room = rooms.find(r => r.name === name.toLowerCase());
    if (!room) return null;

    // Data Migration: If the room has an old 'content' field but no 'pages'
    if (room.content !== undefined && !room.pages) {
      console.log(`Migrating room ${room.name} to multi-page schema`);
      room.pages = [{ title: 'Main', content: room.content }];
      delete room.content;
      // Note: We don't necessarily need to save back here, it will be saved on the next update
    }

    // Ensure pages is always an array
    if (!room.pages) {
      room.pages = [{ title: 'Main', content: '' }];
    }

    // Add helper method to match Mongoose
    return {
      ...room,
      comparePassword: async (candidate) => await bcrypt.compare(candidate, room.password)
    };
  },

  async updateRoomPages(name, pages) {
    try {
      await dbConnect();
      if (!global.mongoose.isMock) {
        return await Room.findOneAndUpdate(
          { name: name.toLowerCase() },
          { pages, lastModified: Date.now() },
          { new: true }
        );
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
      console.log('Using JSON fallback for update');
    }

    const rooms = await getRooms();
    const index = rooms.findIndex(r => r.name === name.toLowerCase());
    if (index === -1) return null;

    rooms[index].pages = pages;
    rooms[index].lastModified = new Date();
    await saveRooms(rooms);
    return rooms[index];
  }
};
