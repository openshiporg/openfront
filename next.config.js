const withPreconstruct = require("@preconstruct/next");
const fs = require("fs");
const jsconfig = require("./jsconfig.json");

const theme = process.env.ADMIN_THEME || "KeystoneUI";

const themeAliases = {
  "@keystone/components": `keystone/themes/${theme}/components`,
  "@keystone/screens": `keystone/themes/${theme}/screens`,
  "@keystone/views": `keystone/themes/${theme}/views`,
};

function valueToArray(obj) {
  const newObj = {};
  for (const key in obj) {
    newObj[`${key}/*`] = [`${obj[key]}/*`];
  }
  return newObj;
}

// we add the theme aliases to the jsconfig.json so AutoImport and cmd+click works
if (process.env.NODE_ENV !== "production") {
  jsconfig.compilerOptions.paths = {
    ...jsconfig.compilerOptions.paths,
    ...valueToArray(themeAliases),
  };

  fs.writeFileSync("jsconfig.json", JSON.stringify(jsconfig, null, 2));
}

const nextConfig = {
  /*
      next@13 automatically bundles server code for server components.
      This causes a problem for the prisma binary built by Keystone.
      We need to explicitly ask Next.js to opt-out from bundling
      dependencies that use native Node.js APIs.
      More here: https://beta.nextjs.org/docs/api-reference/next.config.js#servercomponentsexternalpackages
    */
  webpack: (config, { isServer }) => {
    config.externals = [...(config.externals || []), ".prisma/client"];

    config.resolve.alias = {
      ...config.resolve.alias,
      ...themeAliases,
    };
    // Components
    // config.plugins.push(
    //   new webpack.NormalModuleReplacementPlugin(
    //     /keystone\/components\/(.*)$/,
    //     function (resource) {
    //       resource.request = resource.request.replace(
    //         /keystone\/components\/(.*)$/,
    //         `keystone/components/$1/${theme}`
    //       );
    //     }
    //   )
    // );

    // // Screens
    // config.plugins.push(
    //   new webpack.NormalModuleReplacementPlugin(
    //     /keystone\/screens\/(.*)$/,
    //     function (resource) {
    //       resource.request = resource.request.replace(
    //         /keystone\/screens\/(.*)$/,
    //         `keystone/screens/$1/${theme}`
    //       );
    //     }
    //   )
    // );

    // // Views
    // config.plugins.push(
    //   new webpack.NormalModuleReplacementPlugin(
    //     /keystone\/views\/(.*)$/,
    //     function (resource) {
    //       resource.request = resource.request.replace(
    //         /keystone\/views\/(.*)$/,
    //         `keystone/views/$1/${theme}`
    //       );
    //     }
    //   )
    // );

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
