import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { cn } from "@keystone/utils/cn";
import { Badge } from "@keystone/themes/Tailwind/orion/primitives/default/ui/badge";

const ColoredSquare = ({ className, children }) => (
  <span
    data-square
    className={cn(
      "flex size-5 items-center justify-center rounded text-xs font-medium",
      className
    )}
    aria-hidden="true"
  >
    {children}
  </span>
);

const statusColors = {
  pending: "cyan",
  completed: "green",
  archived: "zinc",
  canceled: "red",
  requires_action: "orange",
};

const STATUS_COUNTS_QUERY = gql`
  query GetStatusCounts {
    pendingCount: ordersCount(where: { status: { equals: pending } })
    completedCount: ordersCount(where: { status: { equals: completed } })
    archivedCount: ordersCount(where: { status: { equals: archived } })
    canceledCount: ordersCount(where: { status: { equals: canceled } })
    requiresActionCount: ordersCount(
      where: { status: { equals: requires_action } }
    )
  }
`;

export function StatusSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: statusCounts, loading } = useQuery(STATUS_COUNTS_QUERY);

  const statuses = [
    { value: "pending", label: "Pending", count: statusCounts?.pendingCount },
    {
      value: "completed",
      label: "Completed",
      count: statusCounts?.completedCount,
    },
    {
      value: "archived",
      label: "Archived",
      count: statusCounts?.archivedCount,
    },
    {
      value: "canceled",
      label: "Canceled",
      count: statusCounts?.canceledCount,
    },
    {
      value: "requires_action",
      label: "Requires Action",
      count: statusCounts?.requiresActionCount,
    },
  ];

  const statusFilter = searchParams.get("!status_matches");
  let value = null;

  if (statusFilter) {
    try {
      const parsed = JSON.parse(decodeURIComponent(statusFilter));
      if (Array.isArray(parsed) && parsed.length > 0) {
        value = parsed[0].value?.toLowerCase();
      }
    } catch (e) {
      // Invalid JSON in URL, ignore
    }
  }

  const selectedStatus = statuses.find((s) => s.value === value);

  const handleChange = (status) => {
    const params = new URLSearchParams(searchParams);

    if (status === value) {
      params.delete("!status_matches");
    } else {
      const statusObject = [
        {
          label:
            status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
          value: status,
        },
      ];
      params.set("!status_matches", JSON.stringify(statusObject));
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger
        className={cn(
          "h-9 rounded-lg text-sm shadow-sm font-medium tracking-wide ps-2 w-56",
          "[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_[data-square]]:shrink-0"
        )}
      >
        <SelectValue
          placeholder={
            <span className="text-xs uppercase tracking-wide">
              Filter by Status
            </span>
          }
        >
          {selectedStatus ? (
            <div className="flex items-center gap-2.5">
              <Badge
                className="border py-0.5 text-xs"
                color={statusColors[selectedStatus.value]}
              >
                {loading
                  ? "-"
                  : statusCounts?.[
                      `${selectedStatus.value.replace("_", "")}Count`
                    ] || 0}
              </Badge>
              <span className="uppercase text-sm">{selectedStatus.label}</span>
            </div>
          ) : (
            <span className="uppercase tracking-wide opacity-75 px-2">
              Filter by Status
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
        <SelectGroup>
          <SelectLabel className="text-muted-foreground font-normal text-xs ps-2">
            Filter by status
          </SelectLabel>
          {statuses.map((status) => (
            <SelectItem
              key={status.value}
              value={status.value}
              className="text-xs font-medium"
            >
              <Badge
                className="border py-0.5 text-xs"
                color={statusColors[status.value]}
              >
                {loading ? "-" : status.count || 0}
              </Badge>
              <span className="whitespace-normal break-words min-w-0 flex-1 uppercase tracking-wide mr-2 ml-0.5">
                {status.label}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
