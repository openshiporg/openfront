export default function filterProductsByStatus(
  products,
  status
) {
  return products.filter((product) => product.status === status);
}
