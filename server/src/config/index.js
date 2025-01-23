import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION,
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION,
    useRefreshToken: process.env.USE_REFRESH_TOKEN === "false",
  },
  frontendUrl: process.env.FRONTEND_URL,
  database: {
    url: process.env.DATABASE_URL,
  },
  apiUrl: "http://localhost:5000",
};
