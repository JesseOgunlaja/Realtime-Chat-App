/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["crypto-js"],
  webpack: (config, { isServer }) => {
    isServer && (config.externals = [...config.externals, "socket.io-client"]);
    return config;
  },
};

module.exports = nextConfig;
