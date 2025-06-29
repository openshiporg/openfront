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
import { Loader2, Minus, Plus } from "lucide-react";
import { createReturnAction, getReturnReasonsAction } from '../../actions/return-actions';
import { toast } from 'sonner';

interface ReturnItem {
  lineItemId: string;
  quantity: number;
  returnReasonId?: string;
  note?: string;
}

interface CreateReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

interface ReturnReason {
  id: string;
  value: string;
  label: string;
  description?: string;
  parentReturnReason?: {
    id: string;
    label: string;
  };
}

const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100); // Assuming amounts are in cents
};

export const CreateReturnModal = ({ isOpen, onClose, order }: CreateReturnModalProps) => {
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [returnReasons, setReturnReasons] = useState<ReturnReason[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noNotification, setNoNotification] = useState(false);

  // Calculate total refund amount
  const totalRefundAmount = returnItems.reduce((total, returnItem) => {
    const lineItem = order?.lineItems?.find((li: any) => li.id === returnItem.lineItemId);
    if (lineItem?.moneyAmount?.amount) {
      return total + (lineItem.moneyAmount.amount * returnItem.quantity);
    }
    return total;
  }, 0);

  // Load return reasons on mount
  useEffect(() => {
    if (isOpen) {
      loadReturnReasons();
      // Initialize return items for each line item with 0 quantity
      if (order?.lineItems) {
        setReturnItems(
          order.lineItems.map((item: any) => ({
            lineItemId: item.id,
            quantity: 0,
            returnReasonId: '',
            note: '',
          }))
        );
      }
    }
  }, [isOpen, order]);

  const loadReturnReasons = async () => {
    setIsLoading(true);
    try {
      const response = await getReturnReasonsAction();
      if (response.success) {
        setReturnReasons(response.data);
      } else {
        toast.error("Failed to load return reasons");
      }
    } catch (error) {
      console.error('Error loading return reasons:', error);
      toast.error("Failed to load return reasons");
    } finally {
      setIsLoading(false);
    }
  };

  const updateReturnItemQuantity = (lineItemId: string, quantity: number) => {
    setReturnItems(prev => 
      prev.map(item => 
        item.lineItemId === lineItemId 
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      )
    );
  };

  const updateReturnItemField = (lineItemId: string, field: keyof ReturnItem, value: any) => {
    setReturnItems(prev => 
      prev.map(item => 
        item.lineItemId === lineItemId 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter items with quantity > 0
    const itemsToReturn = returnItems.filter(item => item.quantity > 0);
    
    if (itemsToReturn.length === 0) {
      toast.error("Please select at least one item to return");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createReturnAction({
        orderId: order.id,
        returnItems: itemsToReturn,
        refundAmount: totalRefundAmount,
        noNotification,
      });

      if (response.success) {
        toast.success("Return request created successfully");
        onClose();
      } else {
        toast.error(response.error || "Failed to create return");
      }
    } catch (error) {
      console.error('Error creating return:', error);
      toast.error("Failed to create return");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSelectedItems = returnItems.some(item => item.quantity > 0);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Return</DialogTitle>
          <DialogDescription>
            Select the items you want to return for order #{order?.displayId}.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading return reasons...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Select Items to Return</h3>
              
              {order?.lineItems?.map((lineItem: any) => {
                const returnItem = returnItems.find(ri => ri.lineItemId === lineItem.id);
                const maxQuantity = lineItem.quantity || 0;
                
                return (
                  <div key={lineItem.id} className="border rounded-lg p-4 space-y-3">
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
                        <Label>Return Quantity</Label>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateReturnItemQuantity(
                              lineItem.id, 
                              (returnItem?.quantity || 0) - 1
                            )}
                            disabled={!returnItem?.quantity}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            max={maxQuantity}
                            value={returnItem?.quantity || 0}
                            onChange={(e) => updateReturnItemQuantity(
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
                            onClick={() => updateReturnItemQuantity(
                              lineItem.id, 
                              (returnItem?.quantity || 0) + 1
                            )}
                            disabled={(returnItem?.quantity || 0) >= maxQuantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Return Reason</Label>
                        <Select
                          value={returnItem?.returnReasonId || ''}
                          onValueChange={(value) => updateReturnItemField(
                            lineItem.id, 
                            'returnReasonId', 
                            value
                          )}
                          disabled={!returnItem?.quantity}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            {returnReasons.map((reason) => (
                              <SelectItem key={reason.id} value={reason.id}>
                                {reason.label}
                                {reason.description && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    - {reason.description}
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {returnItem?.quantity > 0 && (
                      <div className="space-y-2">
                        <Label>Note (Optional)</Label>
                        <Textarea
                          placeholder="Add a note about this return item..."
                          value={returnItem?.note || ''}
                          onChange={(e) => updateReturnItemField(
                            lineItem.id, 
                            'note', 
                            e.target.value
                          )}
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {hasSelectedItems && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Refund Amount:</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(totalRefundAmount, order.currency?.code)}
                    </span>
                  </div>
                  
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
                    Creating Return...
                  </>
                ) : (
                  'Create Return'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
