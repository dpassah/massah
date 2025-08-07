/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zopvdryyhkzeemcbhbxf.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'your-cdn.com',   // ضع دومينك أو *.supabase.co
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
