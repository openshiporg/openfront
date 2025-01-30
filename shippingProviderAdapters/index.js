export const shippingProviderAdapters = {
  shippo: () => import("./shippo"),
  manual: () => import("./manual"),
};
