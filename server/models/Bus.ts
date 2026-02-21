import mongoose from "mongoose";

const busSchema = new mongoose.Schema({
    busId: { type: String, required: true, unique: true },
    busNumber: { type: String, required: true, unique: true },
    busType: { type: String, required: true },
    acType: { type: String, enum: ["AC", "Non-AC"], required: true },
    avgMileage: { type: Number, default: 0 },
    lastMaintenanceDate: { type: String },
    nextMaintenanceDate: { type: String },
    busStatus: { type: String, enum: ["Active", "In Maintenance", "Retired"], required: true },
    capacity: { type: Number, required: true },
    fuelType: { type: String, enum: ["Diesel", "CNG", "Electric"], required: true },
    registrationDate: { type: String },
    manufacturer: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    assignedRoute: { type: String },
    driverId: { type: String },
    conductorId: { type: String },
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret: any) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

export const BusModel = mongoose.model("Bus", busSchema);
