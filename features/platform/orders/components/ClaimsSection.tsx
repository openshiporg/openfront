"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreVertical, AlertTriangle, DollarSign, Package2, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { CreateClaimModal } from "./modals/CreateClaimModal";
import { updateClaimStatusAction } from "../actions/claim-actions";
import { toast } from 'sonner';

interface ClaimsSectionProps {
  order: any;
  claims?: any[];
}

const claimStatusConfig = {
  // Payment Status
  na: { 
    label: "N/A", 
    color: "zinc" as const, 
    icon: Clock,
    description: "No payment action required"
  },
  not_refunded: { 
    label: "Not Refunded", 
    color: "yellow" as const, 
    icon: DollarSign,
    description: "Refund pending"
  },
  refunded: { 
    label: "Refunded", 
    color: "green" as const, 
    icon: CheckCircle,
    description: "Refund has been processed"
  },
  
  // Fulfillment Status
  not_fulfilled: { 
    label: "Not Fulfilled", 
    color: "yellow" as const, 
    icon: Package2,
    description: "Replacement items not yet fulfilled"
  },
  partially_fulfilled: { 
    label: "Partially Fulfilled", 
    color: "blue" as const, 
    icon: Package2,
    description: "Some replacement items fulfilled"
  },
  fulfilled: { 
    label: "Fulfilled", 
    color: "green" as const, 
    icon: CheckCircle,
    description: "All replacement items fulfilled"
  },
  shipped: { 
    label: "Shipped", 
    color: "green" as const, 
    icon: Package2,
    description: "Replacement items have been shipped"
  },
  canceled: { 
    label: "Canceled", 
    color: "red" as const, 
    icon: XCircle,
    description: "Claim has been canceled"
  },
};

const claimTypeConfig = {
  refund: {
    label: "Refund",
    color: "blue" as const,
    icon: DollarSign,
    description: "Customer will receive a refund"
  },
  replace: {
    label: "Replace",
    color: "green" as const,
    icon: Package2,
    description: "Customer will receive replacement items"
  },
};

const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100);
};

export const ClaimsSection = ({ order, claims = [] }: ClaimsSectionProps) => {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleStatusUpdate = async (claimId: string, statusType: 'payment' | 'fulfillment', newStatus: string) => {
    setIsUpdating(claimId);
    try {
      const response = await updateClaimStatusAction(claimId, statusType, newStatus);
      if (response.success) {
        toast.success(`Claim ${statusType} status updated successfully`);
        // Optionally trigger a page refresh or update local state
        window.location.reload();
      } else {
        toast.error(response.error || "Failed to update claim status");
      }
    } catch (error) {
      console.error('Error updating claim status:', error);
      toast.error("Failed to update claim status");
    } finally {
      setIsUpdating(null);
    }
  };

  const canCreateClaim = order?.status !== 'canceled' && order?.lineItems?.length > 0;
  const hasClaims = claims && claims.length > 0;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-medium">Claims</CardTitle>
          {canCreateClaim && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClaimModalOpen(true)}
              className="h-8"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Create Claim
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!hasClaims ? (
            <div className="text-center py-6">
              <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No claims have been created for this order
              </p>
              {canCreateClaim && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsClaimModalOpen(true)}
                  className="mt-3"
                >
                  Create First Claim
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim: any, index: number) => {
                const typeConfig = claimTypeConfig[claim.type as keyof typeof claimTypeConfig];
                const paymentStatusConfig = claimStatusConfig[claim.paymentStatus as keyof typeof claimStatusConfig];
                const fulfillmentStatusConfig = claimStatusConfig[claim.fulfillmentStatus as keyof typeof claimStatusConfig];
                
                const TypeIcon = typeConfig?.icon || AlertTriangle;
                const PaymentIcon = paymentStatusConfig?.icon || Clock;
                const FulfillmentIcon = fulfillmentStatusConfig?.icon || Clock;
                
                return (
                  <div key={claim.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            Claim #{index + 1}
                          </span>
                          <Badge 
                            color={typeConfig?.color || "zinc"} 
                            className="text-xs"
                          >
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeConfig?.label || claim.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {typeConfig?.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Created: {new Date(claim.createdAt).toLocaleDateString()}
                          </span>
                          {claim.refundAmount > 0 && (
                            <span>
                              Refund: {formatCurrency(claim.refundAmount, order.currency?.code)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/dashboard/platform/claims/${claim.id}`}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </Link>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={isUpdating === claim.id}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* Payment Status Updates */}
                            {claim.type === 'refund' && claim.paymentStatus === 'not_refunded' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(claim.id, 'payment', 'refunded')}
                              >
                                Mark as Refunded
                              </DropdownMenuItem>
                            )}
                            
                            {/* Fulfillment Status Updates */}
                            {claim.type === 'replace' && claim.fulfillmentStatus === 'not_fulfilled' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusUpdate(claim.id, 'fulfillment', 'partially_fulfilled')}
                                >
                                  Mark Partially Fulfilled
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusUpdate(claim.id, 'fulfillment', 'fulfilled')}
                                >
                                  Mark Fulfilled
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {claim.type === 'replace' && claim.fulfillmentStatus === 'fulfilled' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(claim.id, 'fulfillment', 'shipped')}
                              >
                                Mark as Shipped
                              </DropdownMenuItem>
                            )}
                            
                            {claim.type === 'replace' && claim.fulfillmentStatus === 'partially_fulfilled' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusUpdate(claim.id, 'fulfillment', 'fulfilled')}
                                >
                                  Mark Fully Fulfilled
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusUpdate(claim.id, 'fulfillment', 'shipped')}
                                >
                                  Mark as Shipped
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {/* General Actions */}
                            <DropdownMenuItem>
                              Edit Claim
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(claim.id, 'fulfillment', 'canceled')}
                              className="text-red-600"
                            >
                              Cancel Claim
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* Status Indicators */}
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Payment:</span>
                        <Badge 
                          color={paymentStatusConfig?.color || "zinc"} 
                          className="text-xs"
                        >
                          <PaymentIcon className="h-3 w-3 mr-1" />
                          {paymentStatusConfig?.label || claim.paymentStatus}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Fulfillment:</span>
                        <Badge 
                          color={fulfillmentStatusConfig?.color || "zinc"} 
                          className="text-xs"
                        >
                          <FulfillmentIcon className="h-3 w-3 mr-1" />
                          {fulfillmentStatusConfig?.label || claim.fulfillmentStatus}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Claim Items Summary */}
                    {claim.claimItems && claim.claimItems.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Claimed Item{claim.claimItems.length !== 1 ? 's' : ''} ({claim.claimItems.length})
                          </span>
                          <div className="grid grid-cols-1 gap-2">
                            {claim.claimItems.slice(0, 3).map((item: any) => (
                              <div key={item.id} className="flex items-center justify-between text-xs">
                                <div className="flex-1">
                                  <span className="truncate">
                                    {item.lineItem?.title || 'Unknown Item'} 
                                    {item.lineItem?.variantData?.title && ` - ${item.lineItem.variantData.title}`}
                                  </span>
                                  <div className="text-muted-foreground">
                                    Reason: {item.reason?.replace('_', ' ')} • Qty: {item.quantity}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {claim.claimItems.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{claim.claimItems.length - 3} more item{claim.claimItems.length - 3 !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      <CreateClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        order={order}
      />
    </>
  );
};