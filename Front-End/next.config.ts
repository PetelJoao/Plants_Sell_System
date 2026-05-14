/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kikuuhndrprxaynaxfpe.supabase.co", /*domínio do Supabase*/
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;