const allowedOrigins = process.env.CLIENT_ORIGINS
  ? process.env.CLIENT_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

export const corsOptions = {
  origin: (origin, callback) => {
    console.log("Request Origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("CORS Blocked Origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
