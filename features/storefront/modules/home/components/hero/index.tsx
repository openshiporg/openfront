"use client";

import { DotsShader } from "../dots-shader";

interface HeroProps {
  title?: string;
  description?: string;
}

const Hero = ({ title, description }: HeroProps) => {
  return (
    <div className="h-[75vh] w-full border-b border-border relative bg-slate-900">
      <DotsShader
        className="absolute inset-0"
        squareSize={3}
        gridGap={3}
        color="rgb(59, 130, 246)"
        maxOpacity={0.5}
        flickerChance={0.3}
      />

      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center sm:p-32 gap-6">
        <span>
          <h1 className="text-4xl leading-10 text-white font-bold tracking-tight">
            {title || "E-commerce Starter Template"}
          </h1>
          <h2 className="mt-2 uppercase tracking-wider text-xl leading-10 text-blue-200 font-bold">
            {description || "Powered by Openfront and Next.js"}
          </h2>
        </span>
      </div>
    </div>
  );
};

export default Hero;
