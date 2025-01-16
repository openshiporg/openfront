'use client';

import React from 'react';
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/dialog";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { Label } from "@ui/label";
import { Textarea } from "@ui/textarea";
import { useToast } from "@ui/use-toast";

const CREATE_STOCK_MOVEMENT = gql`
  mutation CreateStockMovement($data: StockMovementCreateInput!) {
    createStockMovement(data: $data) {
      id
      type
      quantity
      variant {
        id
        inventoryQuantity
      }
    }
  }
`;

export default function AdjustStockModal({ isOpen, onClose, variant, onSuccess }) {
  const [type, setType] = React.useState('RECEIVE');
  const [quantity, setQuantity] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [note, setNote] = React.useState('');
  const { toast } = useToast();

  const [createStockMovement, { loading }] = useMutation(CREATE_STOCK_MOVEMENT, {
    onCompleted: () => {
      toast({
        title: "Stock updated successfully",
        description: `${type === 'RECEIVE' ? 'Added' : 'Removed'} ${quantity} units`,
      });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error updating stock",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createStockMovement({
      variables: {
        data: {
          type,
          quantity: parseInt(quantity),
          reason,
          note,
          variant: {
            connect: {
              id: variant.id,
            },
          },
        },
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock Level</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Movement Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RECEIVE">Receive Stock</SelectItem>
                <SelectItem value="REMOVE">Remove Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Restock, Damaged, Lost"
            />
          </div>

          <div className="space-y-2">
            <Label>Note (Optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Additional details about this stock movement"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 