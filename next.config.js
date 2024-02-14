/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["crypto-js"],
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
