"use client";

import { FlaskConical } from "lucide-react";

export default function PlatformLayout({ children }) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 dark:text-blue-500 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        {/* <FlaskConical className="basis-4" /> */}
        <p className="basis-11/12">
          <span className="font-medium">Alpha Mode:</span> You're previewing our new platform interface. Some features may be incomplete or contain bugs.
        </p>
      </div>
      {children}
    </div>
  );
} 