module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
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
