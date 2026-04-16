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
    // Ensure Turbopack resolves packages relative to the client workspace,
    // even when the repo contains multiple lockfiles.
    root: __dirname,
    resolveAlias: {
      tailwindcss: require.resolve('tailwindcss'),
    },
  },
};
