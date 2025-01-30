import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Badge } from "@ui/badge";
import { formatDistance } from "date-fns";
import {
  CheckIcon,
  TruckIcon,
  CreditCardIcon,
  PackageIcon,
  MailIcon,
  ArrowPathIcon,
  XCircleIcon,
  MessageSquareIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@ui/button";

const getEventIcon = (type) => {
  switch (type) {
    case 'STATUS_CHANGE':
      return <ArrowPathIcon className="h-5 w-5" />;
    case 'PAYMENT_STATUS_CHANGE':
      return <CreditCardIcon className="h-5 w-5" />;
    case 'FULFILLMENT_STATUS_CHANGE':
      return <TruckIcon className="h-5 w-5" />;
    case 'NOTE_ADDED':
      return <MessageSquareIcon className="h-5 w-5" />;
    case 'EMAIL_SENT':
      return <MailIcon className="h-5 w-5" />;
    case 'TRACKING_NUMBER_ADDED':
      return <PackageIcon className="h-5 w-5" />;
    case 'RETURN_REQUESTED':
      return <XCircleIcon className="h-5 w-5" />;
    case 'REFUND_PROCESSED':
      return <CreditCardIcon className="h-5 w-5" />;
    default:
      return <CheckIcon className="h-5 w-5" />;
  }
};

const getEventDescription = (event) => {
  const { type, data, user } = event;
  const actor = user?.name || 'System';

  switch (type) {
    case 'STATUS_CHANGE':
      return `${actor} changed order status from ${data.previousStatus} to ${data.newStatus}`;
    case 'PAYMENT_STATUS_CHANGE':
      return `${actor} changed payment status from ${data.previousStatus} to ${data.newStatus}`;
    case 'FULFILLMENT_STATUS_CHANGE':
      return `${actor} changed fulfillment status from ${data.previousStatus} to ${data.newStatus}`;
    case 'NOTE_ADDED':
      return `${actor} added a note: ${data.note}`;
    case 'EMAIL_SENT':
      return `Email sent to customer: ${data.template}`;
    case 'TRACKING_NUMBER_ADDED':
      return `${actor} added tracking ${data.shippingLabels.length > 1 ? 'numbers' : 'number'}: ${
        data.shippingLabels.map(label => label.number).join(', ')
      }`;
    case 'RETURN_REQUESTED':
      return `Return requested for order`;
    case 'REFUND_PROCESSED':
      return `Refund processed for ${data.amount}`;
    default:
      return `Unknown event type: ${type}`;
  }
};

const getEventBadgeVariant = (type) => {
  switch (type) {
    case 'STATUS_CHANGE':
      return 'default';
    case 'PAYMENT_STATUS_CHANGE':
      return 'success';
    case 'FULFILLMENT_STATUS_CHANGE':
      return 'info';
    case 'NOTE_ADDED':
      return 'secondary';
    case 'EMAIL_SENT':
      return 'outline';
    case 'TRACKING_NUMBER_ADDED':
      return 'info';
    case 'RETURN_REQUESTED':
      return 'destructive';
    case 'REFUND_PROCESSED':
      return 'warning';
    default:
      return 'secondary';
  }
};

export function OrderTimeline({ events }) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:dark:via-slate-700 before:to-transparent">
          {sortedEvents.map((event, index) => (
            <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon */}
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border 
                border-white dark:border-zinc-800 
                bg-slate-300 dark:bg-slate-700 
                group-[.is-active]:bg-emerald-500 dark:group-[.is-active]:bg-emerald-600
                text-slate-500 dark:text-slate-400 
                group-[.is-active]:text-emerald-50 
                shadow shrink-0 md:order-1 
                md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2
              `}>
                {getEventIcon(event.type)}
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-zinc-900 p-4 rounded border border-slate-200 dark:border-slate-800 shadow">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {event.type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                  </div>
                  <Badge variant={getEventBadgeVariant(event.type)}>
                    {formatDistance(new Date(event.createdAt), new Date(), { addSuffix: true })}
                  </Badge>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  {getEventDescription(event)}
                  {event.type === 'TRACKING_NUMBER_ADDED' && event.data.shippingLabels?.some(label => label.url) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {event.data.shippingLabels.map((label, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={label.url} target="_blank" rel="noopener noreferrer">
                            Track Package {event.data.shippingLabels.length > 1 ? `#${i + 1}` : ''}
                          </a>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 