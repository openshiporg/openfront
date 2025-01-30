"use client";

import { FlaskConical } from "lucide-react";

export default function PlatformLayout({ children }) {
  return (
    <div className="flex flex-col h-full">
      {children ? (
        children
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <FlaskConical className="h-12 w-12" />
          <div className="text-center space-y-2">
            <h3 className="font-medium text-lg">Page Coming Soon</h3>
            <p className="text-sm">This section is currently under development</p>
          </div>
        </div>
      )}
      <div className="shadow-lg max-w-4xl mx-auto text-xs md:text-sm mt-auto flex items-center gap-3 px-4 py-2 text-blue-600 dark:text-blue-500 bg-blue-50/50 dark:bg-blue-900/20 border-t border-r border-l border-blue-200 dark:border-blue-800 rounded-t-lg">
        <p>
          <span className="font-medium">Alpha Mode:</span> You're previewing our
          new platform interface. Some features may be incomplete or contain
          bugs.
        </p>
      </div>
    </div>
  );
}
