import { Circle, Square, Triangle } from "lucide-react";
import Link from "next/link";
import { DM_Sans, Montserrat, Nunito_Sans, Outfit } from "next/font/google";
import { cn } from "./utils/cn";

const montserrat = Outfit({ subsets: ["latin"] });

export const Logo = ({ size = "md", className }) => {
  const sizeClasses = {
    sm: "text-xs md:text-md",
    md: "text-md md:text-2xl",
    lg: "text-2xl md:text-3xl",
  };

  return (
    <h3 className={cn(`${montserrat.className} ${className}`)}>
      <div
        className={cn(
          "flex items-center gap-2.5 text-slate-700 dark:text-white",
          sizeClasses[size]
        )}
      >
        <Triangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[1.1rem] md:h-[1.1rem] fill-indigo-200 stroke-indigo-400 dark:stroke-indigo-600 dark:fill-indigo-950" />
        <h1 className={cn("tracking-[0.02em] mb-1.5 font-medium text-center")}>
          open<span className="font-light">front</span>{" "}
        </h1>
      </div>
    </h3>
  );
};

export const Logo2 = () => {
  return (
    <h3 className={`${montserrat.className}`}>
      <div className="flex items-center gap-2.5 text-slate-700 dark:text-white">
        <Circle
          size={18}
          className="fill-emerald-200 stroke-emerald-400 dark:stroke-emerald-600 dark:fill-emerald-950"
        />
        <h1
          className={`tracking-[0.02em] mb-1.5 text-xl md:text-2xl font-medium text-center`}
        >
          open
          <span className="font-light">ship</span>{" "}
        </h1>
      </div>
    </h3>
  );
};

export const Logo3 = () => {
  return (
    <h3 className={`${montserrat.className}`}>
      <div className="flex items-center gap-2.5 text-slate-700 dark:text-white">
        <Square
          size={18}
          className="fill-orange-300 stroke-orange-500 dark:stroke-amber-600 dark:fill-amber-950"
        />
        <h1
          className={`tracking-[0.02em] mb-1.5 text-xl md:text-2xl font-medium text-center`}
        >
          open
          <span className="font-light">support</span>{" "}
        </h1>
      </div>
    </h3>
  );
};

function PenroseTriangle({ isDarkMode, width = 10, height = 10 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.0"
      width={width}
      height={height}
      viewBox="28 0 500 450.655"
      // className="-ml-2"
    >
      <defs>
        <linearGradient
          id="lightBlueGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            style={{
              stopColor: "#60a5fa",
              stopOpacity: 1,
            }}
          />
          <stop
            offset="50%"
            style={{
              stopColor: "#3b82f6",
              stopOpacity: 1,
            }}
          />
          <stop
            offset="100%"
            style={{
              stopColor: "#1d4ed8",
              stopOpacity: 1,
            }}
          />
        </linearGradient>
        <linearGradient id="darkBlueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop
            offset="0%"
            style={{
              stopColor: "#60a5fa",
              stopOpacity: 1,
            }}
          />
          <stop
            offset="50%"
            style={{
              stopColor: "#60a5fa",
              stopOpacity: 1,
            }}
          />
          <stop
            offset="100%"
            style={{
              stopColor: "#2563eb",
              stopOpacity: 1,
            }}
          />
        </linearGradient>
      </defs>
      <g transform="translate(-91.423882,-253.5866)">
        <path
          d="m 152.8995,686.96086 180.07131,-313.12889 116.09275,198.7303 61.51436,10e-6 L 330.88818,262.95533 120.49362,630.81525 Z"
          style={{
            fill: `url(#${
              isDarkMode ? "lightBlueGradient" : "lightBlueGradient"
            })`,
            fillOpacity: 0.95,
          }}
        />
        <path
          d="M 335.20128,262.93615 516.34319,575.44693 286.19133,576.62106 255.43412,629.89407 613.4065,629.08165 400.02772,262.94464 Z"
          style={{
            fill: `url(#${
              isDarkMode ? "lightBlueGradient" : "lightBlueGradient"
            })`,
            fillOpacity: 0.8,
          }}
        />
        <path
          d="M 610.54226,632.73114 249.329,633.34925 363.38811,433.44481 332.63093,380.17178 154.3483,690.59116 578.12168,688.86824 Z"
          style={{
            fill: `url(#${
              isDarkMode ? "lightBlueGradient" : "lightBlueGradient"
            })`,
            fillOpacity: 0.7,
          }}
        />
      </g>
    </svg>
  );
}
