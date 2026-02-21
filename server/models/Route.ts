import mongoose from "mongoose";

const stopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String },
});

const routeSchema = new mongoose.Schema({
    busNumber: { type: String, required: true },
    routeName: { type: String, required: true },
    stops: [stopSchema],
    frequency: { type: String, required: true },
    operatingHours: {
        start: { type: String, required: true },
        end: { type: String, required: true },
    },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    capacity: { type: Number, required: true },
    currentPassengers: { type: Number, default: 0 },
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

export const RouteModel = mongoose.model("Route", routeSchema);
