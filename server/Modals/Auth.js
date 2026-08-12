import mongoose from "mongoose";

const loginRecordSchema = new mongoose.Schema(
  {
    loginAt: { type: Date, default: Date.now },
    ipAddress: { type: String, default: "unknown" },
    browser: { type: String, default: "Unknown browser" },
    operatingSystem: { type: String, default: "Unknown OS" },
    deviceType: { type: String, default: "Desktop" },
    deviceModel: { type: String, default: "" },
    city: { type: String, default: "Unavailable" },
    state: { type: String, default: "Unavailable" },
    country: { type: String, default: "Unavailable" },
    userAgent: { type: String, default: "" },
    isNewDevice: { type: Boolean, default: false },
    trusted: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  themePreference: { type: String, enum: ["light", "dark", "system"], default: "system" },
  loginHistory: { type: [loginRecordSchema], default: [] },
  joinedon: { type: Date, default: Date.now },
});

export default mongoose.model("user", userSchema);
