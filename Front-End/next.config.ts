const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kikuuhndrprxaynaxfpe.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // ← remove o bloco webpack inteiro
}

module.exports = nextConfig