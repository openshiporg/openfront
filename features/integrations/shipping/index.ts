export const shippingProviderAdapters = {
  shippo: () => import("./shippo"),
  shipengine: () => import("./shipengine"),
  manual: () => import("./manual"),
};
