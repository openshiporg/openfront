import { keystoneContext } from "@keystone/keystoneContext";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black">
      <div className="px-4 md:px-6 mx-auto">
        <div className="grid gap-6 items-center">
          <div className="flex flex-col justify-center space-y-24">
            <div className="space-y-2">
              <h1
                className={`mb-3 text-3xl md:text-4xl font-semibold text-center`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block w-8 h-8 mr-2 stroke-rose-700"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M18.816 13.58c2.292 2.138 3.546 4 3.092 4.9c-.745 1.46 -5.783 -.259 -11.255 -3.838c-5.47 -3.579 -9.304 -7.664 -8.56 -9.123c.464 -.91 2.926 -.444 5.803 .805"></path>
                  <path d="M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                </svg>
                open
                <span className="font-normal">front</span>{" "}
              </h1>
            </div>
            <div className="w-full max-w-full space-y-4 mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 max-w-screen-lg mx-auto">
                <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                  <Link
                    href="/"
                    className="group rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30"
                  >
                    <h2 className={`mb-3 text-xl md:text-2xl font-semibold`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="inline-block w-5 h-5 mb-1 mr-3 stroke-emerald-700"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                        />
                      </svg>
                      Storefront{" "}
                      <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        -&gt;
                      </span>
                    </h2>
                    <p
                      className={`m-0 max-w-[30ch] text-sm md:text-base opacity-50`}
                    >
                      Openfront comes with a storefront that will appear here{" "}
                    </p>
                    <span className="text-emerald-700 text-sm md:text-base font-bold rounded tracking-wide">
                      COMING SOON
                    </span>
                  </Link>
                </div>
                <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                  <Link
                    href="/dashboard"
                    className="group rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30"
                  >
                    <h2 className={`mb-3 text-xl md:text-2xl font-semibold`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="inline-block w-5 h-5 mb-1 mr-3 stroke-blue-700"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                        />
                      </svg>
                      Admin UI{" "}
                      <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        -&gt;
                      </span>
                    </h2>
                    <p
                      className={`m-0 max-w-[30ch] text-sm md:text-base opacity-50`}
                    >
                      Openfront comes with a full-fledged Admin UI
                    </p>
                    <span className="text-blue-700 text-sm md:text-base font-bold rounded tracking-wide">
                      READY
                    </span>
                  </Link>
                </div>
                <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                  <Link
                    href="/api/graphql"
                    className="group rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30"
                  >
                    <h2 className={`mb-3 text-xl md:text-2xl font-semibold`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline-block w-5 h-5 mb-1 mr-3 stroke-fuchsia-500"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path d="M5.308 7.265l5.385 -3.029"></path>
                        <path d="M13.308 4.235l5.384 3.03"></path>
                        <path d="M20 9.5v5"></path>
                        <path d="M18.693 16.736l-5.385 3.029"></path>
                        <path d="M10.692 19.765l-5.384 -3.03"></path>
                        <path d="M4 14.5v-5"></path>
                        <path d="M12.772 4.786l6.121 10.202"></path>
                        <path d="M18.5 16h-13"></path>
                        <path d="M5.107 14.988l6.122 -10.201"></path>
                        <path d="M12 3.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                        <path d="M12 20.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                        <path d="M4 8m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                        <path d="M4 16m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                        <path d="M20 16m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                        <path d="M20 8m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
                      </svg>
                      GraphQL API{" "}
                      <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        -&gt;
                      </span>
                    </h2>
                    <p
                      className={`m-0 max-w-[30ch] text-sm md:text-base opacity-50`}
                    >
                      Openfront comes with a GraphQL API and Playground
                    </p>
                    <span className="text-fuchsia-500 text-sm md:text-base font-bold rounded tracking-wide">
                      READY
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// const Home = async () => {
//   const users = await keystoneContext.sudo().query.User.findMany({
//     query: "id name",
//   });

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between p-2 md:p-24">
//       <div className="relative flex flex-col items-center w-full px-2 md:px-0 before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
//         <h1 className={`mb-3 text-3xl md:text-4xl font-semibold text-center`}>
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="inline-block w-8 h-8 mr-2 stroke-rose-700"
//             viewBox="0 0 24 24"
//             strokeWidth="2"
//             stroke="currentColor"
//             fill="none"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           >
//             <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
//             <path d="M18.816 13.58c2.292 2.138 3.546 4 3.092 4.9c-.745 1.46 -5.783 -.259 -11.255 -3.838c-5.47 -3.579 -9.304 -7.664 -8.56 -9.123c.464 -.91 2.926 -.444 5.803 .805"></path>
//             <path d="M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
//           </svg>
//           open
//           <span className="font-normal">front</span>{" "}
//         </h1>
//       </div>
//       <div className="mb-12 md:mb-32 grid w-full px-2 md:px-0 text-center grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 lg:max-w-5xl lg:text-left">
//         <Link
//           href="/"
//           className="group rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//         >
//           <h2 className={`mb-3 text-xl md:text-2xl font-semibold`}>
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={2}
//               stroke="currentColor"
//               className="inline-block w-5 h-5 mb-1 mr-3 stroke-emerald-700"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
//               />
//             </svg>
//             Storefront{" "}
//             <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//               -&gt;
//             </span>
//           </h2>
//           <p className={`m-0 max-w-[30ch] text-sm md:text-base opacity-50`}>
//             Openfront comes with a storefront that will appear here{" "}
//           </p>
//           <span className="text-emerald-700 text-sm md:text-base font-bold rounded tracking-wide">
//             COMING SOON
//           </span>
//         </Link>
//         <Link
//           href="/dashboard"
//           className="group rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//         >
//           <h2 className={`mb-3 text-xl md:text-2xl font-semibold`}>
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={2}
//               stroke="currentColor"
//               className="inline-block w-5 h-5 mb-1 mr-3 stroke-blue-700"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
//               />
//             </svg>
//             Admin UI{" "}
//             <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//               -&gt;
//             </span>
//           </h2>
//           <p className={`m-0 max-w-[30ch] text-sm md:text-base opacity-50`}>
//             Openfront comes with a full-fledged Admin UI
//           </p>
//           <span className="text-blue-700 text-sm md:text-base font-bold rounded tracking-wide">
//             READY
//           </span>
//         </Link>
//         <Link
//           href="/api/graphql"
//           className="group rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//         >
//           <h2 className={`mb-3 text-xl md:text-2xl font-semibold`}>
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="inline-block w-5 h-5 mb-1 mr-3 stroke-fuchsia-500"
//               width="24"
//               height="24"
//               viewBox="0 0 24 24"
//               strokeWidth="2"
//               stroke="currentColor"
//               fill="none"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
//               <path d="M5.308 7.265l5.385 -3.029"></path>
//               <path d="M13.308 4.235l5.384 3.03"></path>
//               <path d="M20 9.5v5"></path>
//               <path d="M18.693 16.736l-5.385 3.029"></path>
//               <path d="M10.692 19.765l-5.384 -3.03"></path>
//               <path d="M4 14.5v-5"></path>
//               <path d="M12.772 4.786l6.121 10.202"></path>
//               <path d="M18.5 16h-13"></path>
//               <path d="M5.107 14.988l6.122 -10.201"></path>
//               <path d="M12 3.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
//               <path d="M12 20.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
//               <path d="M4 8m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
//               <path d="M4 16m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
//               <path d="M20 16m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
//               <path d="M20 8m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
//             </svg>
//             GraphQL API{" "}
//             <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//               -&gt;
//             </span>
//           </h2>
//           <p className={`m-0 max-w-[30ch] text-sm md:text-base opacity-50`}>
//             Openfront comes with a GraphQL API and Playground
//           </p>
//           <span className="text-fuchsia-500 text-sm md:text-base font-bold rounded tracking-wide">
//             READY
//           </span>
//         </Link>
//       </div>
//     </main>
//   );
// };

// export default Home;
