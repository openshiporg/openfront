"use client";

export default function PlatformLayout({ children }) {
  return (
    <div className="flex flex-col h-full">
      {children}
      <div className="shadow-lg max-w-4xl mx-auto text-xs md:text-sm mt-auto flex items-center gap-3 px-4 py-2 text-blue-600 dark:text-blue-500 bg-blue-50/50 dark:bg-blue-900/20 border-t border-r border-l border-blue-200 dark:border-blue-800 rounded-t-lg">
        <p>
          <span className="font-medium">Alpha Mode:</span> You&apos;re previewing our
          new platform interface. Some features may be incomplete or contain
          bugs.
        </p>
      </div>
    </div>
  );
}
