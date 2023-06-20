import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

const Home = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{" "}
          <Link legacyBehavior href="/">
            <a className="text-blue-600">Openfront!</a>
          </Link>
        </h1>

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
          <Link legacyBehavior href="/">
            <a className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold">Storefront</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 mt-1.5 rounded ">
                  SOON
                </span>
              </div>
              <p className="mt-4 text-xl">
                Openfront comes with a storefront that will appear here{" "}
              </p>
            </a>
          </Link>

          <Link legacyBehavior href="/dashboard">
            <a className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600">
              <h3 className="text-2xl font-bold">Admin UI</h3>
              <p className="mt-4 text-xl">
                Openfront comes with a full Admin UI
              </p>
            </a>
          </Link>

          <Link legacyBehavior href="/api/graphql">
            <a className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600">
              <h3 className="text-2xl font-bold">GraphQL API</h3>
              <p className="mt-4 text-xl">
                Openfront comes with a GraphQL API and Playground
              </p>
            </a>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
