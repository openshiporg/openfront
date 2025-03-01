import { Building2, AlertCircle, Loader2, Check } from "lucide-react";
import { cn } from "@keystone/utils/cn";
import { Badge } from "@keystone/themes/Tailwind/orion/primitives/default/ui/badge";

const CreationStep = ({ items, creationProgress }) => {
  // Follow the same order as the steps configuration
  const stepOrder = [
    { id: "currencies", title: "Currencies" },
    { id: "regions", title: "Regions" },
    { id: "payment-providers", title: "Payment Providers" },
    { id: "shipping", title: "Shipping Options" },
    { id: "categories", title: "Categories" },
    { id: "collections", title: "Collections" },
    { id: "products", title: "Products" }
  ];

  const getStepStatus = (stepId) => {
    const items = creationProgress[stepId] || [];
    if (items.length === 0) return "pending";
    
    const hasError = items.some(item => item.status === "error");
    if (hasError) return "error";
    
    const allComplete = items.every(item => 
      item.status === "complete" || 
      item.status === "skipped"
    );
    if (allComplete) return "complete";
    
    return "loading";
  };

  const getStepDetails = (stepId) => {
    const items = creationProgress[stepId] || [];
    const completed = items.filter(item => item.status === "complete").length;
    const skipped = items.filter(item => item.status === "skipped").length;
    const errors = items.filter(item => item.status === "error").length;
    const total = items.length;

    return { completed, skipped, errors, total };
  };

  return (
    <div className="space-y-3">
      {stepOrder.map(({ id, title }) => {
        const status = getStepStatus(id);
        const details = getStepDetails(id);

        const hasItems = details.total > 0;

        return (
          <div key={id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Badge 
              color={{
                pending: "zinc",
                loading: "blue",
                complete: "emerald",
                error: "red"
              }[status]}
              className="text-xs tracking-wide flex items-center gap-x-1.5 rounded-md px-1.5 py-0.5 uppercase border">
                {status === "pending" && <div className="w-3 h-3" />}
                {status === "loading" && <Loader2 size={12} strokeWidth={2} className="animate-spin" />}
                {status === "complete" && <Check size={12} strokeWidth={2} />}
                {status === "error" && <AlertCircle size={12} strokeWidth={2} />}
                <span>{title}</span>
              </Badge>
              {hasItems && (
                <span className="text-xs text-muted-foreground">
                  {details.completed > 0 && `${details.completed} created`}
                  {details.skipped > 0 && (details.completed > 0 ? ", " : "") + `${details.skipped} already exist`}
                  {details.errors > 0 && (details.completed > 0 || details.skipped > 0 ? ", " : "") + `${details.errors} failed`}
                </span>
              )}
            </div>
            {(details.errors > 0) && (
              <div className="ml-6 space-y-1">
                {creationProgress[id]
                  .filter(item => item.status === "error" && !item.error?.includes("unique constraint"))
                  .map(item => (
                    <div key={item.code || item.name || item.handle} className="text-xs text-red-600">
                      {item.error}
                    </div>
                  ))}
                {creationProgress[id]
                  .filter(item => item.status === "skipped" || (item.status === "error" && item.error?.includes("unique constraint")))
                  .map(item => (
                    <div key={item.code || item.name || item.handle} className="text-xs text-blue-600 flex items-center gap-1">
                      <Check size={10} strokeWidth={2} />
                      {item.code || item.name || item.handle} already exists
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
      })}
      
      {creationProgress.storefrontUrl && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-border p-4">
          <Building2 className="mt-0.5 shrink-0 text-blue-500" size={16} strokeWidth={2} aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Store Created Successfully!</p>
            <p className="text-sm text-muted-foreground">
              Your storefront is available {" "}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                here
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreationStep; 