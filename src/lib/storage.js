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
    const isProduction = process.env.NODE_ENV === 'production' || process.env.NETLIFY;

    try {
      await dbConnect();
      if (!global.mongoose.isMock) {
        return await Room.create({ name, password, pages: [{ title: 'Main', content: '' }] });
      }
      if (isProduction) throw new Error('Database connection is in mock mode but production requires a real DB.');
    } catch (err) {
      if (isProduction) throw err;
      console.log('Using JSON fallback for creation');
    }

    // JSON Fallback (Only for local dev)
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
    const isProduction = process.env.NODE_ENV === 'production' || process.env.NETLIFY;

    try {
      await dbConnect();
      if (!global.mongoose.isMock) {
        return await Room.findOne({ name: name.toLowerCase() });
      }
      if (isProduction) throw new Error('Database connection is in mock mode but production requires a real DB.');
    } catch (err) {
      if (isProduction) throw err;
      console.log('Using JSON fallback for lookup');
    }

    const rooms = await getRooms();
    let room = rooms.find(r => r.name === name.toLowerCase());
    if (!room) return null;

    if (room.content !== undefined && !room.pages) {
      room.pages = [{ title: 'Main', content: room.content }];
      delete room.content;
    }

    if (!room.pages) {
      room.pages = [{ title: 'Main', content: '' }];
    }

    return {
      ...room,
      comparePassword: async (candidate) => await bcrypt.compare(candidate, room.password)
    };
  },

  async updateRoomPages(name, pages) {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.NETLIFY;

    try {
      await dbConnect();
      if (!global.mongoose.isMock) {
        return await Room.findOneAndUpdate(
          { name: name.toLowerCase() },
          { pages, lastModified: Date.now() },
          { new: true }
        );
      }
      if (isProduction) throw new Error('Database connection is in mock mode but production requires a real DB.');
    } catch (err) {
      if (isProduction) throw err;
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
