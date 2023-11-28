const fs = require("fs");
const path = require("path");
// const jsconfig = require("./jsconfig.json");
let jsconfig;
const theme = process.env.ADMIN_THEME || "KeystoneUI";
const jsconfigPath = path.join(__dirname, "jsconfig.json");

const themeAliases = {
  "@keystone/components": `keystone/themes/${theme}/components`,
  "@keystone/screens": `keystone/themes/${theme}/screens`,
  "@keystone/views": `keystone/themes/${theme}/views`,
  "@keystone/primitives": `keystone/themes/${theme}/primitives`,
};

function valueToArray(obj) {
  const newObj = {};
  for (const key in obj) {
    newObj[`${key}/*`] = [`${obj[key]}/*`];
  }
  return newObj;
}

function getDefaultJsconfig() {
  return {
    "compilerOptions": {
      "target": "ESNext",
      "lib": ["dom", "dom.iterable", "esnext"],
      "allowJs": true,
      "skipLibCheck": true,
      "strict": true,
      "forceConsistentCasingInFileNames": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "incremental": true,
      "baseUrl": ".",
      "paths": {
        "@lib/*": ["lib/*"],
        "@keystone/*": ["keystone/*"],
        "@storefront/*": ["storefront/*"],
        "@modules/*": ["modules/*"],
        "@pages/*": ["pages/*"],
        "@svg": ["svg"],
        ...valueToArray(themeAliases), // Includes the dynamic theme aliases
      }
    },
    "include": [
      "**/*.js",
      "*.js",
    ],
    "exclude": ["node_modules"]
  };
}


function updateJsconfigAliases() {
  if (fs.existsSync(jsconfigPath)) {
    jsconfig = require(jsconfigPath);
  } else {
    jsconfig = getDefaultJsconfig();
  }

  jsconfig.compilerOptions.paths = {
    ...jsconfig.compilerOptions.paths,
    ...valueToArray(themeAliases),
  };

  fs.writeFileSync(jsconfigPath, JSON.stringify(jsconfig, null, 2));
}

function configureWebpack(config, { isServer }) {
  config.externals = [
    ...(config.externals || []),
    ".prisma/client",
    "@aws-sdk/signature-v4-multi-region",
  ];

  config.resolve.alias = {
    ...config.resolve.alias,
    ...themeAliases,
  };

  return config;
}

if (process.env.NODE_ENV !== "production") {
  updateJsconfigAliases();
}

const nextConfig = {
  webpack: configureWebpack,
  experimental: {
    serverComponentsExternalPackages: ["graphql"],
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

module.exports = nextConfig;
