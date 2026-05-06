import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const PageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Main',
  },
  content: {
    type: String,
    default: '',
  },
});

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a room name'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Room name cannot be more than 50 characters'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  pages: {
    type: [PageSchema],
    default: [{ title: 'Main', content: '' }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  }
});

// Hash password before saving
RoomSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
RoomSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Room || mongoose.model('Room', RoomSchema);
