import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"

export const metadata = {
  title: "Home",
  description:
    "Shop all available models only at the ACME. Worldwide Shipping. Secure Payment.",
}

const Home = () => {
  return <>
    <Hero />
    <FeaturedProducts />
  </>;
}

export default Home
