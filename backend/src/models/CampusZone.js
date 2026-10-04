import mongoose from 'mongoose';

const campusZoneSchema = new mongoose.Schema(
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
    buildingCode: {
      type: String,
      default: '',
    },
    // Center point coordinates
    center: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    radiusMeters: {
      type: Number,
      default: 150,
    },
    // Polygon vertices [[lat, lng], [lat, lng], ...]
    polygon: [
      {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    ],
    color: {
      type: String,
      default: '#10b981',
    },
    floors: [
      {
        floorNumber: Number,
        name: String,
        rooms: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const CampusZone = mongoose.model('CampusZone', campusZoneSchema);
