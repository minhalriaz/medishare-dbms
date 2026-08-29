import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/:path*', // ব্যাকএন্ডের পোর্ট ৪০০০ এখানে রুট করে দেওয়া হলো
      },
    ];
  },
};

export default nextConfig;