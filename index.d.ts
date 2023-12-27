declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      PORT: string;
      TZ: string;
      REDIS_URL: string;
      NEXT_PUBLIC_REDIS_URL: string;
      REDIS_SECRET: string;
      PUSHER_ID: string;
      PUSHER_KEY: string;
      PUSHER_SECRET: string;
      NEXT_PUBLIC_PUSHER_KEY: string;
      PUSHER_SECRET_KEY: string;
      ENCRYPTION_KEY: string;
      NEXT_PUBLIC_ENCRYPTION_KEY: string;
      SIGNING_KEY: string;
      NEXT_PUBLIC_SIGNING_KEY: string;
      URL: string;
      NEXT_PUBLIC_URL: string;
      WEBSOCKET_KEY: string;
      NEXT_PUBLIC_WEBSOCKET_URL: string;
      WEBSOCKET_URL: string;
      FILESTACK_API_KEY: string;
    }
  }
}

export {};
