/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@claudprox/shared", "@claudprox/server"],
};

module.exports = nextConfig;
