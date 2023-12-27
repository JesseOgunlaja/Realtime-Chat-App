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

if (
  process.env.LD_LIBRARY_PATH == null ||
  !process.env.LD_LIBRARY_PATH.includes(
    `${process.env.PWD}/node_modules/canvas/build/Release:`
  )
) {
  process.env.LD_LIBRARY_PATH = `${
    process.env.PWD
  }/node_modules/canvas/build/Release:${process.env.LD_LIBRARY_PATH || ""}`;
}

module.exports = nextConfig;
