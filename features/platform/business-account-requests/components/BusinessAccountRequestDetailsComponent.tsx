"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Building, 
  Mail, 
  Calendar, 
  DollarSign, 
  Users, 
  Check,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { updateBusinessAccountRequestStatus } from "../actions";
import { toast } from "@/components/ui/use-toast";

const statusColors = {
  "pending": "yellow",
  "approved": "emerald", 
  "not_approved": "red",
  "requires_info": "orange"
} as const;

const statusIconColors = {
  "pending": "text-yellow-500",
  "approved": "text-emerald-500", 
  "not_approved": "text-red-500",
  "requires_info": "text-orange-500"
} as const;

interface BusinessAccountRequest {
  id: string;
  businessName: string;
  businessType: string;
  monthlyOrderVolume: string;
  requestedCreditLimit: number;
  formattedRequestedCredit: string;
  businessDescription: string;
  status: string;
  statusLabel: string;
  submittedAt: string;
  reviewNotes?: string;
  approvedCreditLimit?: number;
  formattedApprovedCredit?: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface BusinessAccountRequestDetailsComponentProps {
  businessAccountRequest: BusinessAccountRequest;
  list: any;
}

export function BusinessAccountRequestDetailsComponent({ 
  businessAccountRequest, 
  list 
}: BusinessAccountRequestDetailsComponentProps) {
  const router = useRouter();
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState(businessAccountRequest.reviewNotes || '');
  const [approvedCredit, setApprovedCredit] = useState(
    businessAccountRequest.approvedCreditLimit ? (businessAccountRequest.approvedCreditLimit / 100).toString() : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getBusinessTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      wholesale: 'Wholesale Partner',
      distribution: 'Distribution Channel',
      reseller: 'Authorized Reseller',
      b2b_platform: 'B2B Platform',
      other: 'Other'
    };
    return typeMap[type] || type;
  };

  const getVolumeLabel = (volume: string) => {
    const volumeMap: Record<string, string> = {
      low: '1-50 orders/month',
      medium: '51-200 orders/month',
      high: '201-1000 orders/month',
      enterprise: '1000+ orders/month'
    };
    return volumeMap[volume] || volume;
  };

  const getStatusIcon = (status: string) => {
    const iconColorClass = statusIconColors[status as keyof typeof statusIconColors] || "text-gray-500";
    switch (status) {
      case 'pending':
        return <Clock className={`h-4 w-4 ${iconColorClass}`} />;
      case 'approved':
        return <CheckCircle className={`h-4 w-4 ${iconColorClass}`} />;
      case 'not_approved':
        return <XCircle className={`h-4 w-4 ${iconColorClass}`} />;
      case 'requires_info':
        return <AlertCircle className={`h-4 w-4 ${iconColorClass}`} />;
      default:
        return <Clock className={`h-4 w-4 ${iconColorClass}`} />;
    }
  };

  const handleReviewSubmit = async (action: 'approved' | 'rejected') => {
    setIsSubmitting(true);
    try {
      const result = await updateBusinessAccountRequestStatus(
        businessAccountRequest.id,
        action,
        reviewNotes,
        approvedCredit ? parseInt(approvedCredit) * 100 : undefined
      );

      if (result.success) {
        toast({
          title: "Request Updated",
          description: `Account request has been ${action}.`,
        });
        setIsReviewDialogOpen(false);
        router.refresh(); // Refresh the page to show updated data
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update request.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message || "Failed to update request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="p-6 border-l-4 border-l-transparent hover:border-l-blue-500 hover:bg-muted/50 transition-all">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold truncate">
                {businessAccountRequest.user 
                  ? `${businessAccountRequest.user.name} • ${businessAccountRequest.user.email}`
                  : "User Information Unavailable"
                }
              </h3>
            </div>

            <div className="text-sm text-muted-foreground mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4" />
                <span>{businessAccountRequest.businessName}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                <span>{businessAccountRequest.formattedRequestedCredit} credit requested</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Submitted {new Date(businessAccountRequest.submittedAt).toLocaleDateString()}</span>
              </div>
              {businessAccountRequest.reviewNotes && (
                <div className="mt-3 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm font-medium text-foreground mb-1">Review Notes</p>
                  <p className="text-sm">{businessAccountRequest.reviewNotes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center gap-2">
              <Badge
                color={statusColors[businessAccountRequest.status as keyof typeof statusColors] || "zinc"}
                className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
              >
                {businessAccountRequest.statusLabel.toUpperCase()}
              </Badge>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="border [&_svg]:size-3 h-6 w-6"
                    >
                      <MoreVertical className="stroke-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
                      Edit Request
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Delete Request
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {businessAccountRequest.status === 'pending' && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="border [&_svg]:size-3 h-6 w-6"
                    onClick={() => setIsReviewDialogOpen(true)}
                  >
                    <Check className="stroke-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="pb-4 border-b">Review Account Request - {businessAccountRequest.businessName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Business Name</Label>
                <p className="text-sm">{businessAccountRequest.businessName}</p>
              </div>
              <div>
                <Label className="font-medium">Business Type</Label>
                <p className="text-sm">{getBusinessTypeLabel(businessAccountRequest.businessType)}</p>
              </div>
              <div>
                <Label className="font-medium">Contact</Label>
                <div className="text-sm">
                  {businessAccountRequest.user ? (
                    <>
                      <p>{businessAccountRequest.user.name}</p>
                      <p className="text-muted-foreground">{businessAccountRequest.user.email}</p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">User information unavailable</p>
                  )}
                </div>
              </div>
              <div>
                <Label className="font-medium">Monthly Volume</Label>
                <p className="text-sm">{getVolumeLabel(businessAccountRequest.monthlyOrderVolume)}</p>
              </div>
              <div>
                <Label className="font-medium">Requested Credit</Label>
                <p className="text-sm">{businessAccountRequest.formattedRequestedCredit}</p>
              </div>
              <div>
                <Label className="font-medium">Submitted</Label>
                <p className="text-sm">{new Date(businessAccountRequest.submittedAt).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <Label className="font-medium">Business Description</Label>
              <p className="text-sm mt-1">{businessAccountRequest.businessDescription}</p>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="approvedCredit">Approved Credit Limit (USD)</Label>
                <Input
                  id="approvedCredit"
                  type="number"
                  placeholder={(businessAccountRequest.requestedCreditLimit / 100).toString()}
                  value={approvedCredit}
                  onChange={(e) => setApprovedCredit(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="reviewNotes">Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  placeholder="Add any notes about this decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleReviewSubmit('approved')}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Request
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleReviewSubmit('rejected')}
                  disabled={isSubmitting}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject Request
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <EditItemDrawerClientWrapper
        listKey="business-account-requests"
        itemId={businessAccountRequest.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        onSave={() => {
          router.refresh();
        }}
      />
    </>
  );
}