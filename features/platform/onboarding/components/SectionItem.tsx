import React from 'react';
import { AlertCircle, CircleCheck, Info } from 'lucide-react';
import { RiLoader4Line } from '@remixicon/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface SectionItemProps {
  item: string;
  sectionType: string;
  status: 'normal' | 'loading' | 'completed' | 'error';
  errorMessage?: string;
  requiresEnvVar?: {
    vars: string[];
    description?: string;
  };
  step?: 'template' | 'progress' | 'done';
}

export const SectionItem: React.FC<SectionItemProps> = ({
  item,
  status,
  errorMessage,
  requiresEnvVar,
  step,
}) => {
  // Determine styling based on status
  const getItemStyles = () => {
    switch (status) {
      case 'completed':
        return 'bg-blue-50 dark:bg-blue-900/10 border-blue-400/20 dark:border-blue-700/50';
      case 'loading':
        return 'bg-background border-blue-500/30 dark:border-blue-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800';
      default:
        return 'border-border';
    }
  };

  // Render the appropriate icon based on status
  const renderStatusIcon = () => {
    switch (status) {
      case 'completed':
        return (
          <CircleCheck className="mr-1.5 h-3.5 w-3.5 fill-blue-500 text-background" />
        );
      case 'loading':
        return (
          <RiLoader4Line className="mr-1.5 h-3.5 w-3.5 animate-spin text-blue-500" />
        );
      case 'error':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <AlertCircle className="mr-1.5 h-3.5 w-3.5 text-red-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                align="start"
                className="p-4 text-xs min-w-[250px] max-w-[450px] z-[100]"
              >
                <div className="font-medium text-sm mb-2 text-red-600 dark:text-red-400">
                  Failed to create {item}
                </div>
                <div className="text-sm text-left mb-3">
                  This item already exists or conflicts with existing data in
                  your installation.
                </div>
                <div className="font-mono text-xs text-left whitespace-pre-wrap break-words max-h-[150px] overflow-y-auto text-muted-foreground border-t pt-3 mt-1">
                  <span className="font-semibold block mb-1">
                    Error details:
                  </span>
                  {errorMessage || 'Unknown error'}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`inline-flex items-center px-2 py-1 border rounded-md text-xs ${getItemStyles()}`}
    >
      {renderStatusIcon()}
      <span>{item}</span>
      {requiresEnvVar && requiresEnvVar.vars.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className={`ml-2 h-3 w-3 cursor-help ${
                  step === 'done' ? 'text-red-500' : 'text-blue-500'
                }`}
                aria-hidden={true}
              />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              align="start"
              className="p-3 text-xs max-w-sm z-[100]"
            >
              <p>
                Requires
                {requiresEnvVar.vars.map((envVar, index) => (
                  <React.Fragment key={envVar}>
                    {index > 0 && ' and '}
                    <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
                      {envVar}
                    </code>
                  </React.Fragment>
                ))}
                in your
                <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
                  .env
                </code>
                file
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};