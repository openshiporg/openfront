import React from "react";
import { useRouter } from "next/navigation";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Checkbox } from "@ui/checkbox";
import { MoreHorizontal, Pencil, Trash2, Eye, Download, Upload, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";

const UPDATE_SHIPPING_OPTION = gql`
  mutation UpdateShippingOption($where: ShippingOptionWhereUniqueInput!, $data: ShippingOptionUpdateInput!) {
    updateShippingOption(where: $where, data: $data) {
      id
      adminOnly
    }
  }
`;

const DELETE_SHIPPING_OPTION = gql`
  mutation DeleteShippingOption($where: ShippingOptionWhereUniqueInput!) {
    deleteShippingOption(where: $where) {
      id
    }
  }
`;

const BULK_UPDATE_SHIPPING_OPTIONS = gql`
  mutation BulkUpdateShippingOptions($ids: [ID!]!, $data: ShippingOptionUpdateInput!) {
    bulkUpdateShippingOptions(ids: $ids, data: $data) {
      count
    }
  }
`;

const BULK_DELETE_SHIPPING_OPTIONS = gql`
  mutation BulkDeleteShippingOptions($ids: [ID!]!) {
    bulkDeleteShippingOptions(ids: $ids) {
      count
    }
  }
`;

export function ShippingOptionList({ shippingOptions, isLoading, error, onPageChange, total, onDelete }) {
  const router = useRouter();
  const [updateShippingOption] = useMutation(UPDATE_SHIPPING_OPTION);
  const [deleteShippingOption] = useMutation(DELETE_SHIPPING_OPTION);
  const [bulkUpdateShippingOptions] = useMutation(BULK_UPDATE_SHIPPING_OPTIONS);
  const [bulkDeleteShippingOptions] = useMutation(BULK_DELETE_SHIPPING_OPTIONS);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const ITEMS_PER_PAGE = 10;

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await updateShippingOption({
        variables: {
          where: { id },
          data: { adminOnly: !currentStatus },
        },
      });
    } catch (error) {
      console.error("Error toggling shipping option status:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteShippingOption({
        variables: {
          where: { id },
        },
      });
      onDelete?.();
    } catch (error) {
      console.error("Error deleting shipping option:", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteShippingOptions({
        variables: {
          ids: selectedIds,
        },
      });
      setSelectedIds([]);
      onDelete?.();
    } catch (error) {
      console.error("Error bulk deleting shipping options:", error);
    }
  };

  const handleBulkToggleActive = async (status) => {
    try {
      await bulkUpdateShippingOptions({
        variables: {
          ids: selectedIds,
          data: { adminOnly: status },
        },
      });
      setSelectedIds([]);
      onDelete?.();
    } catch (error) {
      console.error("Error bulk updating shipping options:", error);
    }
  };

  const handleDuplicate = async (id) => {
    const option = shippingOptions.find(opt => opt.id === id);
    if (!option) return;

    try {
      const { name, regionId, providerId, profileId, price, requirements, taxRates } = option;
      router.push("/dashboard/platform/shipping/new", {
        state: {
          duplicate: {
            name: `${name} (Copy)`,
            regionId,
            providerId,
            profileId,
            price,
            requirements,
            taxRates: taxRates.map(tax => tax.id),
          },
        },
      });
    } catch (error) {
      console.error("Error duplicating shipping option:", error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price / 100);
  };

  const formatRequirements = (requirements) => {
    if (!requirements) return null;

    const { minSubtotal, maxSubtotal, minItems, maxItems } = requirements;
    const parts = [];

    if (minSubtotal) parts.push(`Min. subtotal: ${formatPrice(minSubtotal)}`);
    if (maxSubtotal) parts.push(`Max. subtotal: ${formatPrice(maxSubtotal)}`);
    if (minItems) parts.push(`Min. items: ${minItems}`);
    if (maxItems) parts.push(`Max. items: ${maxItems}`);

    return parts.length > 0 ? parts.join(", ") : "No requirements";
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    onPageChange(newPage);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(shippingOptions.map(option => option.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (checked, id) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-secondary/10 p-2 rounded-md">
          <p className="text-sm">
            {selectedIds.length} shipping option{selectedIds.length > 1 ? "s" : ""} selected
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkToggleActive(true)}
            >
              Deactivate All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkToggleActive(false)}
            >
              Activate All
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Shipping Options</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedIds.length} shipping option{selectedIds.length > 1 ? "s" : ""}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csvContent = shippingOptions.map(option => ({
                name: option.name,
                region: option.region?.name,
                provider: option.provider?.name,
                profile: option.profile?.name,
                price: formatPrice(option.price),
                requirements: formatRequirements(option.requirements),
                status: option.adminOnly ? "Inactive" : "Active",
              }));
              
              const csv = Papa.unparse(csvContent);
              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "shipping-options.csv";
              a.click();
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedIds.length === shippingOptions.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Requirements</TableHead>
              <TableHead>Tax Rates</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-red-500">
                  Error loading shipping options
                </TableCell>
              </TableRow>
            ) : shippingOptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-zinc-500">
                  No shipping options found
                </TableCell>
              </TableRow>
            ) : (
              shippingOptions.map((option) => (
                <TableRow key={option.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(option.id)}
                      onCheckedChange={(checked) => handleSelectOne(checked, option.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.name}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant={!option.adminOnly ? "success" : "secondary"}>
                              {!option.adminOnly ? "Active" : "Inactive"}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Click the menu to toggle status</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>
                    {option.region ? (
                      <Badge variant="outline">{option.region.name}</Badge>
                    ) : (
                      <span className="text-sm text-zinc-500">No Region</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.provider?.name}</span>
                      <span className="text-xs text-zinc-500">
                        {option.provider?.code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.profile?.name}</span>
                      <span className="text-xs text-zinc-500">
                        {option.profile?.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatPrice(option.price)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-500">
                      {formatRequirements(option.requirements)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {option.taxRates.map((tax) => (
                        <Badge key={tax.id} variant="secondary">
                          {tax.rate}%
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/platform/shipping/${option.id}`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Option
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(option.id, option.adminOnly)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {option.adminOnly ? "Activate" : "Deactivate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(option.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Option
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Shipping Option</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this shipping option? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(option.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-zinc-500">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 