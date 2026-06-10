import dotenv from "dotenv";

dotenv.config();

export const env = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  // Database
  MONGODB_URI: (() => {
    const uri = process.env.MONGODB_URI;
    if (!uri && process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL: MONGODB_URI environment variable is not set in production. " +
        "This is required for the application to work. Set it in your .env file."
      );
    }
    const defaultUri = "mongodb://localhost:27017/pms_local";
    const finalUri = uri || defaultUri;
    
    // Safety check: warn if the URI doesn't specify a database name
    if (finalUri.includes("mongodb+srv://") || finalUri.includes("mongodb://")) {
      const hasDbName = finalUri.includes(".net/") 
        ? /\.net\/([^?/]+)/.test(finalUri) 
        : /:\d+\/([^?/]+)/.test(finalUri);
      if (!hasDbName) {
        console.warn("⚠️  WARNING: MONGODB_URI does not specify a database name. Mongoose will default to 'test'!");
      }
    }
    return finalUri;
  })(),

  // JWT
  JWT_SECRET: (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL: JWT_SECRET environment variable is not set in production. " +
        "This is required for security. Set it in your .env file."
      );
    }
    if (!secret && process.env.NODE_ENV !== "production") {
      console.warn("⚠️  WARNING: JWT_SECRET is using a default value in development. This is acceptable for development only.");
    }
    return secret || "dev-secret-key-change-in-production";
  })(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
};
