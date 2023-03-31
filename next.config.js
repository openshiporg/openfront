const withPreconstruct = require("@preconstruct/next");

const nextConfig = {
  /*
      next@13 automatically bundles server code for server components.
      This causes a problem for the prisma binary built by Keystone.
      We need to explicitly ask Next.js to opt-out from bundling
      dependencies that use native Node.js APIs.
      More here: https://beta.nextjs.org/docs/api-reference/next.config.js#servercomponentsexternalpackages
    */
  webpack: (config) => {
    config.externals = [...(config.externals || []), ".prisma/client"];
    // Important: return the modified config
    return config;
  },
  async redirects() {
    return [
      {
        source: "/admin/api/graphql",
        destination: "/api/graphql",
        permanent: false,
      },
    ];
  },
};

module.exports = withPreconstruct(nextConfig);
