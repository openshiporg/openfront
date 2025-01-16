import React from "react";
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
import { MoreHorizontal, PlayCircle, StopCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { Progress } from "@ui/progress";
import { formatDistance } from "date-fns";

const UPDATE_BATCH_JOB_MUTATION = gql`
  mutation UpdateBatchJob($where: BatchJobWhereUniqueInput!, $data: BatchJobUpdateInput!) {
    updateBatchJob(where: $where, data: $data) {
      id
      status
    }
  }
`;

export function BatchJobList({ jobs, isLoading, error, onPageChange, total }) {
  const [updateBatchJob] = useMutation(UPDATE_BATCH_JOB_MUTATION);

  if (error) {
    return <div>Error loading batch jobs: {error.message}</div>;
  }

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await updateBatchJob({
        variables: {
          where: { id: jobId },
          data: { status: newStatus },
        },
      });
    } catch (error) {
      console.error("Failed to update batch job:", error);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "processing":
        return "warning";
      case "failed":
        return "destructive";
      case "canceled":
        return "secondary";
      default:
        return "default";
    }
  };

  const getJobTypeLabel = (type) => {
    switch (type) {
      case "product-import":
        return "Product Import";
      case "order-export":
        return "Order Export";
      case "inventory-update":
        return "Inventory Update";
      case "price-update":
        return "Price Update";
      default:
        return type;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {getJobTypeLabel(job.type)}
                    </span>
                    {job.error && (
                      <span className="text-sm text-red-600">
                        {job.error}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(job.status)}>
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="w-[100px]">
                    <Progress value={job.progress} className="h-2" />
                  </div>
                  <span className="text-xs text-zinc-500">
                    {job.progress}%
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {job.createdBy?.name || "System"}
                  </span>
                </TableCell>
                <TableCell>
                  {formatDistance(new Date(job.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  {job.completedAt ? (
                    formatDistance(new Date(job.completedAt), new Date(), {
                      addSuffix: true,
                    })
                  ) : (
                    <span className="text-sm text-zinc-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {job.status === "created" && (
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(job.id, "processing")}
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Start Job
                        </DropdownMenuItem>
                      )}
                      {job.status === "processing" && (
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(job.id, "canceled")}
                        >
                          <StopCircle className="mr-2 h-4 w-4" />
                          Cancel Job
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      {job.result && (
                        <DropdownMenuItem>Download Result</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 