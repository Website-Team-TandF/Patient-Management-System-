# Configuration Setup

## MongoDB Connection

The MongoDB connection URL has been configured in `src/config/env.ts`:

```
MONGODB_URI:
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

## Database Connection

To connect to MongoDB, import and call `connectDB()` in your server file:

```typescript
import { connectDB } from "./config/db";

// Connect to MongoDB
await connectDB();
```

## Usage Example

```typescript
// In server.ts or app.ts
import express from "express";
import { connectDB } from "./config/db";
import { env } from "./config/env";

const app = express();

// Connect to MongoDB
connectDB()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
```
