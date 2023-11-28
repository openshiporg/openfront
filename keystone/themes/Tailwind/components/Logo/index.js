import { useRawKeystone } from "@keystone/keystoneProvider";
import Link from "next/link";

export const Logo = () => {
  const { adminConfig } = useRawKeystone();

  if (adminConfig.components?.Logo) {
    return <adminConfig.components.Logo />;
  }

  return (
    <h3>
      <Link href="/">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline-block w-6 h-6 mr-2 stroke-orange-700"
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
          <h1 className={`mb-1 text-xl md:text-2xl font-semibold text-center`}>
            open
            <span className="font-normal">front</span>{" "}
          </h1>
        </div>
      </Link>
    </h3>
  );
};
