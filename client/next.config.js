module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
  turbopack: {
    root: __dirname,
    resolveAlias: {
      tailwindcss: require.resolve('tailwindcss'),
    },
  },
};
