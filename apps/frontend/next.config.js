/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:4000/api/v1/:path*', // Backend Port: 4000
      },
    ];
  },
};

module.exports = nextConfig;
