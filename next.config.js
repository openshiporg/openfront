module.exports = {
  async redirects() {
    return [
      {
        source: "/admin/api/graphql",
        destination: "/api/graphql",
        permanent: false,
      },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};
