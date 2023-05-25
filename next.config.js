const withPlugins = require("next-compose-plugins");
const { withTamagui } = require("@tamagui/next-plugin");
const withPreconstruct = require("@preconstruct/next");

const nextConfig = {
  webpack: (config) => {
    config.externals = [...(config.externals || []), ".prisma/client"];

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
  experimental: {
    appDir: true,
    // optimizeCss: true,
    esmExternals: true,
    forceSwcTransforms: true,
    scrollRestoration: true,
    legacyBrowsers: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  modularizeImports: {
    '@tamagui/lucide-icons': {
      transform: `@tamagui/lucide-icons/dist/esm/icons/{{kebabCase member}}`,
      skipDefaultConversion: true,
    },
  },
};

const combinedConfig = withPlugins(
  [
    withTamagui({
      config: "./tamagui.config.js",
      components: ["tamagui"],
      useReactNativeWebLite: true,
      disableExtraction: process.env.NODE_ENV === "development",
      excludeReactNativeWebExports: ["Switch", "ProgressBar", "Picker"],
      shouldExtract: (path, projectRoot) => {
        if (path.includes("../packages/myapp")) {
          return true;
        }
      },
      enableCSSOptimizations: false,
      disableFontSupport: false,
      shouldExcludeFromServer: ({ fullPath, request }) => {
        if (fullPath.includes("my-module")) {
          return `commonjs ${commonjs}`;
        }

        if (request === "some-hard-to-bundle-package") {
          return true;
        }
      },
    }),
  ],
  nextConfig
);

module.exports = withPreconstruct(combinedConfig);


// const withPreconstruct = require("@preconstruct/next");

// const nextConfig = {
//   /*
//       next@13 automatically bundles server code for server components.
//       This causes a problem for the prisma binary built by Keystone.
//       We need to explicitly ask Next.js to opt-out from bundling
//       dependencies that use native Node.js APIs.
//       More here: https://beta.nextjs.org/docs/api-reference/next.config.js#servercomponentsexternalpackages
//     */
//   webpack: (config) => {
//     config.externals = [...(config.externals || []), ".prisma/client"];
//     // Important: return the modified config
//     return config;
//   },
//   async redirects() {
//     return [
//       {
//         source: "/admin/api/graphql",
//         destination: "/api/graphql",
//         permanent: false,
//       },
//     ];
//   },
// };

// module.exports = withPreconstruct(nextConfig);


