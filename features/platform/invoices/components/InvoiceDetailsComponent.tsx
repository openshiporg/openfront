"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  FileText, 
  Mail, 
  Calendar, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { updateInvoiceStatus } from "../actions";
import { toast } from "@/components/ui/use-toast";

const statusColors = {
  "active": "emerald",
  "suspended": "red",
  "pending": "yellow"
} as const;

interface Invoice {
  id: string;
  invoiceNumber: string;
  title: string;
  description?: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  creditLimit: number;
  balanceDue: number;
  formattedTotal: string;
  formattedBalance: string;
  formattedCreditLimit: string;
  availableCredit: number;
  formattedAvailableCredit: string;
  currency: {
    id: string;
    code: string;
    symbol: string;
  };
  dueDate?: string;
  paidAt?: string;
  suspendedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  orders: Array<{
    id: string;
    displayId: string;
    total: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

interface InvoiceDetailsComponentProps {
  invoice: Invoice;
  list: any;
}

export function InvoiceDetailsComponent({ 
  invoice, 
  list 
}: InvoiceDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'suspended':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (isUpdatingStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      const result = await updateInvoiceStatus(invoice.id, newStatus);

      if (result.success) {
        toast({
          title: "Status Updated",
          description: `Invoice status has been changed to ${newStatus}.`,
        });
        window.location.reload(); // Refresh the page to show updated data
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update invoice status.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message || "Failed to update invoice status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex items-center justify-between p-4 border-l-4 border-l-transparent hover:border-l-blue-500 hover:bg-muted/50 transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold truncate">{invoice.invoiceNumber}</h3>
          <div className="flex items-center gap-2">
            {getStatusIcon(invoice.status)}
            <Badge 
              variant={statusColors[invoice.status as keyof typeof statusColors] as any || "secondary"}
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>{invoice.formattedBalance}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Due {invoice.dueDate ? formatDate(invoice.dueDate) : 'No due date'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>{invoice.user.name} ({invoice.user.email})</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>Total: {invoice.formattedTotal}</span>
          </div>
        </div>

        <div className="mt-3">
          {invoice.orders && invoice.orders.length > 0 && (
            <p className="text-sm text-muted-foreground">
              <strong>Orders:</strong> {invoice.orders.map(order => `#${order.displayId}`).join(', ')}
            </p>
          )}
          {invoice.paidAt && (
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Paid:</strong> {formatDateTime(invoice.paidAt)}
            </p>
          )}
          {invoice.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              <strong>Description:</strong> {invoice.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isUpdatingStatus}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
              Edit Invoice
            </DropdownMenuItem>
            {invoice.status !== 'active' && (
              <DropdownMenuItem onClick={() => handleStatusUpdate('active')}>
                Set Active
              </DropdownMenuItem>
            )}
            {invoice.status !== 'suspended' && (
              <DropdownMenuItem onClick={() => handleStatusUpdate('suspended')}>
                Suspend Invoice
              </DropdownMenuItem>
            )}
            {invoice.status !== 'pending' && (
              <DropdownMenuItem onClick={() => handleStatusUpdate('pending')}>
                Set Pending
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-red-600">
              Delete Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <EditItemDrawerClientWrapper
          listKey="invoices"
          itemId={invoice.id}
          open={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          onUpdate={() => {
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
}