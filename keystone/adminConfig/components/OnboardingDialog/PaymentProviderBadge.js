import SelectableBadge from "./SelectableBadge";
import { CornerDownRight, Info } from "lucide-react";

const PaymentProviderBadge = ({
  provider,
  checked,
  onCheckedChange,
  disabled,
}) => (
  <div className="space-y-2 w-full">
    <div className="flex items-center gap-2">
      <SelectableBadge
        title={provider.title}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
    {checked &&
      (provider.data.envRequirements ? (
        <div className="flex items-start ml-2">
          <CornerDownRight className="h-4 w-4 text-muted-foreground mt-1.5" />
          <div className="ml-2 space-y-3 w-full">
            <div className="rounded-lg border border-border px-3 py-2">
              <div className="flex gap-3">
                <Info
                  className="mt-0.5 shrink-0 text-blue-500 opacity-60"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <div className="grow space-y-2">
                  <p className="text-[13px]">{provider.data.envTip}</p>
                  <div className="flex flex-wrap gap-2">
                    {provider.data.envRequirements.map((env) => (
                      <div key={env} className="flex items-center">
                        <code className="relative group bg-zinc-100 text-zinc-500 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700 rounded-md px-2 py-1 text-xs font-mono">
                          {env}
                          <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50">
                            <div className="rounded-md shadow-lg p-2 text-xs max-w-xs">
                              <p className="text-muted-foreground">
                                {provider.data.envDescriptions[env]}
                              </p>
                            </div>
                          </div>
                          <Info className="inline-block h-3 w-3 text-muted-foreground ml-1.5" />
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start ml-2">
          <CornerDownRight className="h-4 w-4 text-muted-foreground mt-1.5" />
          <div className="ml-2 w-full">
            <div className="rounded-lg border border-border px-3 py-2">
              <div className="flex gap-3">
                <Info
                  className="mt-0.5 shrink-0 text-blue-500 opacity-60"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <div className="grow space-y-2">
                  <p className="text-[13px]">{provider.data.envTip}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
  </div>
);

export default PaymentProviderBadge; 