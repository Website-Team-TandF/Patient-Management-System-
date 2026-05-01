import dotenv from "dotenv";

dotenv.config();

export const env = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  // Database
  MONGODB_URI: (() => {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/pms_local";
    // Safety check: warn if the URI doesn't specify a database name
    if (uri.includes("mongodb+srv://") || uri.includes("mongodb://")) {
      const hasDbName = uri.includes(".net/") 
        ? /\.net\/([^?/]+)/.test(uri) 
        : /:\d+\/([^?/]+)/.test(uri);
      if (!hasDbName) {
        console.warn("⚠️  WARNING: MONGODB_URI does not specify a database name. Mongoose will default to 'test'!");
      }
    }
    return uri;
  })(),

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
};
