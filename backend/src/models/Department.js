import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'Wrench',
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    headName: {
      type: String,
      default: '',
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Department = mongoose.model('Department', departmentSchema);
