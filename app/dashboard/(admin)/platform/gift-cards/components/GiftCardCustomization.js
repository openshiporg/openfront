import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Label } from "@ui/label";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Textarea } from "@ui/textarea";
import { ColorPicker } from "@ui/color-picker";

export function GiftCardCustomization({ customization, onChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gift Card Customization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Template</Label>
          <div className="grid grid-cols-3 gap-4">
            {['default', 'birthday', 'holiday'].map((template) => (
              <div
                key={template}
                className={`cursor-pointer rounded-lg border p-4 hover:border-primary ${
                  customization.template === template ? 'border-primary' : ''
                }`}
                onClick={() => onChange({ ...customization, template })}
              >
                <img
                  src={`/images/gift-card-templates/${template}.png`}
                  alt={template}
                  className="w-full rounded-md"
                />
                <p className="mt-2 text-center capitalize">{template}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea
            value={customization.message}
            onChange={(e) => onChange({ ...customization, message: e.target.value })}
            placeholder="Enter a personal message..."
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Sender Name</Label>
            <Input
              value={customization.senderName}
              onChange={(e) => onChange({ ...customization, senderName: e.target.value })}
              placeholder="From"
            />
          </div>
          <div className="space-y-2">
            <Label>Recipient Name</Label>
            <Input
              value={customization.recipientName}
              onChange={(e) => onChange({ ...customization, recipientName: e.target.value })}
              placeholder="To"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Color Theme</Label>
          <ColorPicker
            color={customization.color}
            onChange={(color) => onChange({ ...customization, color })}
          />
        </div>

        <Button className="w-full">
          Preview Gift Card
        </Button>
      </CardContent>
    </Card>
  );
} 