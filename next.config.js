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

module.exports = nextConfig;
