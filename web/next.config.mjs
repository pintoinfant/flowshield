/** @type {import('next').NextConfig} */
const nextConfig = {
  // FlowShield - Privacy-focused DeFi Protocol
  poweredByHeader: false,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    unoptimized: true,
    domains: ['github.com', 'raw.githubusercontent.com'],
  },
  
  // Environment variables for FlowShield
  env: {
    APP_NAME: 'FlowShield',
    APP_DESCRIPTION: 'Privacy-focused DeFi protocol for secure transactions',
    APP_URL: 'https://github.com/pintoinfant/flowshield',
  },
  
  // Security headers for DeFi application
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

export default nextConfig
