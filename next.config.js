/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["crypto-js"],
  webpack: (config, { isServer }) => {
    isServer && (config.externals = [...config.externals, "socket.io-client"]);
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        port: "",
        hostname: "cdn.filestackcontent.com",
      },
    ],
  },
};

process.env.LD_LIBRARY_PATH = `/var/task/node_modules/canvas/build/Release:${
  process.env.LD_LIBRARY_PATH || ""
}`;
process.env.LD_PRELOAD =
  "/var/task/node_modules/canvas/build/Release/libz.so.1";

module.exports = nextConfig;
