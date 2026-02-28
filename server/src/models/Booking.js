import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobileNumber: { type: String, default: '', trim: true },
    intention: { type: String, required: true, trim: true },
    program: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

bookingSchema.index({ date: 1, startDateTime: 1, endDateTime: 1, status: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
