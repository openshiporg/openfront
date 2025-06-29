"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, 
  Minus, 
  Plus, 
  Upload, 
  X, 
  AlertTriangle, 
  DollarSign, 
  Package2,
  Image as ImageIcon 
} from "lucide-react";
import { createClaimAction, getClaimTagsAction, uploadClaimImageAction } from '../../actions/claim-actions';
import { toast } from 'sonner';

interface ClaimItem {
  lineItemId: string;
  quantity: number;
  reason: 'missing_item' | 'wrong_item' | 'production_failure' | 'other';
  note?: string;
  images?: string[];
  tags?: string[];
}

interface CreateClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

interface ClaimTag {
  id: string;
  value: string;
  description?: string;
  metadata?: any;
}

const claimReasons = [
  { 
    value: 'missing_item', 
    label: 'Missing Item', 
    description: 'Item was not included in the shipment' 
  },
  { 
    value: 'wrong_item', 
    label: 'Wrong Item', 
    description: 'Incorrect item was sent instead' 
  },
  { 
    value: 'production_failure', 
    label: 'Production Failure', 
    description: 'Item has manufacturing defects or damage' 
  },
  { 
    value: 'other', 
    label: 'Other', 
    description: 'Other reason not listed above' 
  },
];

const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100);
};

export const CreateClaimModal = ({ isOpen, onClose, order }: CreateClaimModalProps) => {
  const [claimType, setClaimType] = useState<'refund' | 'replace'>('refund');
  const [claimItems, setClaimItems] = useState<ClaimItem[]>([]);
  const [claimTags, setClaimTags] = useState<ClaimTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noNotification, setNoNotification] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());

  // Calculate total refund amount for refund claims
  const totalRefundAmount = claimType === 'refund' ? claimItems.reduce((total, claimItem) => {
    const lineItem = order?.lineItems?.find((li: any) => li.id === claimItem.lineItemId);
    if (lineItem?.moneyAmount?.amount) {
      return total + (lineItem.moneyAmount.amount * claimItem.quantity);
    }
    return total;
  }, 0) : 0;

  // Load claim tags on mount
  useEffect(() => {
    if (isOpen) {
      loadClaimTags();
      // Initialize claim items for each line item with 0 quantity
      if (order?.lineItems) {
        setClaimItems(
          order.lineItems.map((item: any) => ({
            lineItemId: item.id,
            quantity: 0,
            reason: 'missing_item' as const,
            note: '',
            images: [],
            tags: [],
          }))
        );
      }
    }
  }, [isOpen, order]);

  const loadClaimTags = async () => {
    setIsLoading(true);
    try {
      const response = await getClaimTagsAction();
      if (response.success) {
        setClaimTags(response.data);
      } else {
        toast.error("Failed to load claim tags");
      }
    } catch (error) {
      console.error('Error loading claim tags:', error);
      toast.error("Failed to load claim tags");
    } finally {
      setIsLoading(false);
    }
  };

  const updateClaimItemQuantity = (lineItemId: string, quantity: number) => {
    setClaimItems(prev => 
      prev.map(item => 
        item.lineItemId === lineItemId 
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      )
    );
  };

  const updateClaimItemField = (lineItemId: string, field: keyof ClaimItem, value: any) => {
    setClaimItems(prev => 
      prev.map(item => 
        item.lineItemId === lineItemId 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const handleImageUpload = async (lineItemId: string, files: FileList) => {
    const claimItem = claimItems.find(item => item.lineItemId === lineItemId);
    if (!claimItem) return;

    const fileArray = Array.from(files);
    setUploadingImages(prev => new Set([...prev, lineItemId]));

    try {
      const uploadPromises = fileArray.map(file => uploadClaimImageAction(file));
      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results
        .filter(result => result.success)
        .map(result => result.data?.url)
        .filter(Boolean);

      if (successfulUploads.length > 0) {
        updateClaimItemField(
          lineItemId, 
          'images', 
          [...(claimItem.images || []), ...successfulUploads]
        );
        toast.success(`${successfulUploads.length} image(s) uploaded successfully`);
      }

      const failedUploads = results.filter(result => !result.success);
      if (failedUploads.length > 0) {
        toast.error(`${failedUploads.length} image(s) failed to upload`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error("Failed to upload images");
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(lineItemId);
        return newSet;
      });
    }
  };

  const removeImage = (lineItemId: string, imageUrl: string) => {
    const claimItem = claimItems.find(item => item.lineItemId === lineItemId);
    if (!claimItem) return;

    updateClaimItemField(
      lineItemId,
      'images',
      (claimItem.images || []).filter(url => url !== imageUrl)
    );
  };

  const toggleTag = (lineItemId: string, tagId: string) => {
    const claimItem = claimItems.find(item => item.lineItemId === lineItemId);
    if (!claimItem) return;

    const currentTags = claimItem.tags || [];
    const isSelected = currentTags.includes(tagId);
    
    updateClaimItemField(
      lineItemId,
      'tags',
      isSelected 
        ? currentTags.filter(id => id !== tagId)
        : [...currentTags, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter items with quantity > 0
    const itemsToClaim = claimItems.filter(item => item.quantity > 0);
    
    if (itemsToClaim.length === 0) {
      toast.error("Please select at least one item to claim");
      return;
    }

    // Validate that all claim items have reasons
    const itemsWithoutReason = itemsToClaim.filter(item => !item.reason);
    if (itemsWithoutReason.length > 0) {
      toast.error("Please select a reason for all claimed items");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createClaimAction({
        orderId: order.id,
        type: claimType,
        claimItems: itemsToClaim,
        refundAmount: totalRefundAmount,
        noNotification,
      });

      if (response.success) {
        toast.success(`${claimType === 'refund' ? 'Refund' : 'Replacement'} claim created successfully`);
        onClose();
      } else {
        toast.error(response.error || "Failed to create claim");
      }
    } catch (error) {
      console.error('Error creating claim:', error);
      toast.error("Failed to create claim");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSelectedItems = claimItems.some(item => item.quantity > 0);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Claim</DialogTitle>
          <DialogDescription>
            Create a claim for missing, wrong, or damaged items in order #{order?.displayId}.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading claim data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Claim Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Claim Type</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    claimType === 'refund' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setClaimType('refund')}
                >
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Refund</div>
                      <div className="text-sm text-muted-foreground">
                        Issue a refund to the customer
                      </div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    claimType === 'replace' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setClaimType('replace')}
                >
                  <div className="flex items-center space-x-2">
                    <Package2 className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Replace</div>
                      <div className="text-sm text-muted-foreground">
                        Send replacement items
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Claim Items */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Select Items to Claim</h3>
              
              {order?.lineItems?.map((lineItem: any) => {
                const claimItem = claimItems.find(ci => ci.lineItemId === lineItem.id);
                const maxQuantity = lineItem.quantity || 0;
                const isUploading = uploadingImages.has(lineItem.id);
                
                return (
                  <Card key={lineItem.id}>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="font-medium">{lineItem.title}</div>
                          {lineItem.variantTitle && (
                            <div className="text-sm text-muted-foreground">
                              {lineItem.variantTitle}
                            </div>
                          )}
                          {lineItem.sku && (
                            <Badge variant="outline" className="text-xs">
                              {lineItem.sku}
                            </Badge>
                          )}
                          <div className="text-sm text-muted-foreground">
                            Max quantity: {maxQuantity} • {lineItem.formattedUnitPrice || formatCurrency(lineItem.moneyAmount?.amount || 0, order.currency?.code)} each
                          </div>
                        </div>
                        
                        {lineItem.thumbnail && (
                          <img 
                            src={lineItem.thumbnail} 
                            alt={lineItem.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Claim Quantity</Label>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateClaimItemQuantity(
                                lineItem.id, 
                                (claimItem?.quantity || 0) - 1
                              )}
                              disabled={!claimItem?.quantity}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              max={maxQuantity}
                              value={claimItem?.quantity || 0}
                              onChange={(e) => updateClaimItemQuantity(
                                lineItem.id, 
                                parseInt(e.target.value) || 0
                              )}
                              className="w-20 text-center"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateClaimItemQuantity(
                                lineItem.id, 
                                (claimItem?.quantity || 0) + 1
                              )}
                              disabled={(claimItem?.quantity || 0) >= maxQuantity}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Claim Reason</Label>
                          <Select
                            value={claimItem?.reason || ''}
                            onValueChange={(value) => updateClaimItemField(
                              lineItem.id, 
                              'reason', 
                              value
                            )}
                            disabled={!claimItem?.quantity}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                              {claimReasons.map((reason) => (
                                <SelectItem key={reason.value} value={reason.value}>
                                  <div>
                                    <div>{reason.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {reason.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {claimItem?.quantity > 0 && (
                        <>
                          <div className="space-y-2">
                            <Label>Note (Optional)</Label>
                            <Textarea
                              placeholder="Add a note about this claim item..."
                              value={claimItem?.note || ''}
                              onChange={(e) => updateClaimItemField(
                                lineItem.id, 
                                'note', 
                                e.target.value
                              )}
                              rows={2}
                            />
                          </div>
                          
                          {/* Image Upload */}
                          <div className="space-y-2">
                            <Label>Images (Optional)</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                              <div className="text-center">
                                <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <div className="text-sm text-gray-600 mb-2">
                                  Upload images to support your claim
                                </div>
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files) {
                                        handleImageUpload(lineItem.id, e.target.files);
                                      }
                                    }}
                                    disabled={isUploading}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isUploading}
                                  >
                                    {isUploading ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose Files
                                      </>
                                    )}
                                  </Button>
                                </label>
                              </div>
                              
                              {/* Uploaded Images */}
                              {claimItem?.images && claimItem.images.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                  {claimItem.images.map((imageUrl, index) => (
                                    <div key={index} className="relative group">
                                      <img
                                        src={imageUrl}
                                        alt={`Claim evidence ${index + 1}`}
                                        className="w-full h-20 object-cover rounded border"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeImage(lineItem.id, imageUrl)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Tags */}
                          {claimTags.length > 0 && (
                            <div className="space-y-2">
                              <Label>Tags (Optional)</Label>
                              <div className="flex flex-wrap gap-2">
                                {claimTags.map((tag) => {
                                  const isSelected = claimItem?.tags?.includes(tag.id);
                                  return (
                                    <Badge
                                      key={tag.id}
                                      variant={isSelected ? "default" : "outline"}
                                      className="cursor-pointer"
                                      onClick={() => toggleTag(lineItem.id, tag.id)}
                                    >
                                      {tag.value}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {hasSelectedItems && (
              <>
                <Separator />
                <div className="space-y-4">
                  {claimType === 'refund' && totalRefundAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Refund Amount:</span>
                      <span className="font-semibold text-lg">
                        {formatCurrency(totalRefundAmount, order.currency?.code)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="no-notification"
                      checked={noNotification}
                      onCheckedChange={setNoNotification}
                    />
                    <Label htmlFor="no-notification" className="text-sm">
                      Don't send notification email to customer
                    </Label>
                  </div>
                </div>
              </>
            )}
            
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!hasSelectedItems || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Claim...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Create {claimType === 'refund' ? 'Refund' : 'Replacement'} Claim
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};