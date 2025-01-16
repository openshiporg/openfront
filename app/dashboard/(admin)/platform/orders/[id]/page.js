"use client";

import React, { Fragment, useCallback, useMemo, useState } from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { makeDataGetter } from "@keystone-6/core/admin-ui/utils";
import { useList } from "@keystone/keystoneProvider";
import { AlertTriangle, ArrowRight, Pen, PencilIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { Button } from "@ui/button";
import { Progress } from "@ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from "@ui/dialog";
import { LoadingIcon } from "@keystone/themes/Tailwind/orion/components/LoadingIcon";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import { Fields } from "./components/Fields";
import { useCreateItem } from "@keystone/keystoneProvider";
import { useUpdateItem } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";
import { deserializeValue, useChangedFieldsAndDataForUpdate, useInvalidFields } from "@keystone-6/core/admin-ui/utils";

export function getFilteredProps(props, modifications, defaultCollapse) {
  const fieldKeysToShow = modifications.map((mod) => mod.key);
  const breakGroups = modifications.reduce((acc, mod) => {
    if (mod.breakGroup) {
      acc.push(mod.breakGroup);
    }
    return acc;
  }, []);

  const newFieldModes = { ...props.fieldModes };

  Object.keys(props.fields).forEach((key) => {
    if (!fieldKeysToShow.includes(key)) {
      newFieldModes[key] = "hidden";
    } else {
      newFieldModes[key] = props.fieldModes[key] || "edit";
    }
  });

  const updatedFields = Object.keys(props.fields).reduce((obj, key) => {
    const modification = modifications.find((mod) => mod.key === key);
    if (modification) {
      obj[key] = {
        ...props.fields[key],
        fieldMeta: {
          ...props.fields[key].fieldMeta,
          ...modification.fieldMeta,
        },
      };
    } else {
      obj[key] = props.fields[key];
    }
    return obj;
  }, {});

  const reorderedFields = modifications.reduce((obj, mod) => {
    obj[mod.key] = updatedFields[mod.key];
    return obj;
  }, {});

  const updatedGroups = props.groups.map((group) => {
    if (breakGroups.includes(group.label)) {
      return {
        ...group,
        fields: group.fields.filter(
          (field) => !fieldKeysToShow.includes(field.path)
        ),
      };
    }
    return {
      ...group,
      collapsed: defaultCollapse,
    };
  });

  return {
    ...props,
    fields: reorderedFields,
    fieldModes: newFieldModes,
    groups: updatedGroups,
  };
}

function getProgressValue(status) {
  switch (status) {
    case 'pending':
      return 25;
    case 'processing':
      return 50;
    case 'shipped':
      return 75;
    case 'completed':
      return 100;
    default:
      return 0;
  }
}

function EditDialog({ title, listKey = "Order", id, modifications }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const list = useList(listKey);
  const { handleUpdate, updateLoading, updateError } = useUpdateItem(listKey);

  const { data, error, loading } = useQuery(
    gql`
      query ($id: ID!) {
        item: ${list.gqlNames.itemQueryName}(where: { id: $id }) {
          id
          ${Object.keys(list.fields)
            .map((field) => list.fields[field].controller.graphqlSelection)
            .join("\n")}
        }
      }
    `,
    { variables: { id } }
  );

  const itemGetter = useMemo(
    () => makeDataGetter(data, error?.graphQLErrors).get("item"),
    [data, error]
  );

  const [state, setValue] = useState(() => ({
    value: deserializeValue(list.fields, itemGetter),
    item: itemGetter,
  }));

  if (data && state.item.data !== itemGetter.data) {
    setValue({
      value: deserializeValue(list.fields, itemGetter),
      item: itemGetter,
    });
  }

  const filteredProps = useMemo(() => {
    // Initialize fieldModes for all fields as edit by default
    const initialFieldModes = {};
    Object.keys(list.fields).forEach(key => {
      initialFieldModes[key] = 'edit';
    });
    
    // If no modifications provided, show all fields
    if (!modifications) {
      return {
        fields: list.fields,
        fieldModes: initialFieldModes,
        groups: list.groups || []
      };
    }
    
    // Create a filtered version of the fields object
    const filteredFields = {};
    modifications.forEach(mod => {
      if (list.fields[mod.key]) {
        filteredFields[mod.key] = list.fields[mod.key];
      }
    });
    
    return getFilteredProps(
      {
        fields: filteredFields,
        fieldModes: initialFieldModes,
        groups: list.groups || []
      },
      modifications,
      true
    );
  }, [list.fields, list.groups, modifications]);

  // Filter the state value to only include the fields we want to show
  const filteredValue = useMemo(() => {
    const newValue = {};
    Object.keys(filteredProps.fields).forEach(key => {
      if (state.value[key] !== undefined) {
        newValue[key] = state.value[key];
      }
    });
    return newValue;
  }, [state.value, filteredProps.fields]);

  const { changedFields, dataForUpdate } = useChangedFieldsAndDataForUpdate(
    filteredProps.fields,
    state.item,
    filteredValue
  );
  const invalidFields = useInvalidFields(filteredProps.fields, filteredValue);

  const handleSave = async () => {
    if (invalidFields.size === 0) {
      await handleUpdate(id, dataForUpdate);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="[&_svg]:size-3 h-6 w-6">
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <LoadingIcon label="Loading item data" />
        ) : (
          <>
            {updateError && (
              <GraphQLErrorNotice
                networkError={updateError?.networkError}
                errors={updateError?.graphQLErrors}
              />
            )}
            <div className="flex-1 overflow-y-auto -mx-6 -my-4">
              <div className="px-6 py-4">
                <Fields
                  fields={filteredProps.fields}
                  groups={filteredProps.groups}
                  fieldModes={filteredProps.fieldModes}
                  value={filteredValue}
                  forceValidation={false}
                  invalidFields={invalidFields}
                  onChange={(value) => {
                    setValue((prev) => ({
                      ...prev,
                      value: {
                        ...prev.value,
                        ...value(filteredValue)
                      },
                    }));
                  }}
                />
              </div>
            </div>
          </>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="light">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleSave}
            // disabled={updateLoading || !changedFields.size}
            // isLoading={updateLoading}
            isLoading
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function OrderPage({ params }) {
  const list = useList("Order");

  const { query, selectedFields } = useMemo(() => {
    const selectedFields = `
      id
      displayId
      status
      fulfillmentStatus
      paymentStatus
      total
      subtotal
      tax
      currency {
        code
        symbol
        name
      }
      metadata
      email
      createdAt
      updatedAt
      canceledAt
      events {
        id
        type
        data
        time
        createdAt
        user {
          id
          name
          email
        }
      }
      payments {
        id
        amount
        status
        data
        metadata
        createdAt
      }
      fulfillments {
        id
        data
        shippedAt
        canceledAt
        metadata
        fulfillmentItems {
          id
          quantity
        }
      }
      user {
        id
        name
        email
        phone
      }
      billingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        countryCode
        phone
      }
      shippingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        countryCode
        phone
      }
      lineItems {
        id
        quantity
        fulfilledQuantity
        returnedQuantity
        shippedQuantity
        metadata
        isReturn
        isGiftcard
        total
        unitPrice
        title
        thumbnail
        description
        availableInRegion
        percentageOff
        originalPrice
        productVariant {
          id
          title
          sku
          barcode
          ean
          upc
          product {
            id
            title
            thumbnail
            description
          }
        }
      }
    `;

    return {
      selectedFields,
      query: gql`
        query ItemPage($id: ID!, $listKey: String!) {
          item: ${list.gqlNames.itemQueryName}(where: {id: $id}) {
            ${selectedFields}
          }
          keystone {
            adminMeta {
              list(key: $listKey) {
                hideCreate
                hideDelete
                fields {
                  path
                  itemView(id: $id) {
                    fieldMode
                    fieldPosition
                  }
                }
              }
            }
          }
        }
      `,
    };
  }, [list]);

  const { data, error, loading } = useQuery(query, {
    variables: { id: params.id, listKey: "Order" },
    errorPolicy: "all",
  });

  const dataGetter = makeDataGetter(data, error?.graphQLErrors);
  const order = data?.item;

  if (loading) return <LoadingIcon label="Loading order data" />;
  if (error?.graphQLErrors.length || error?.networkError) {
    return <GraphQLErrorNotice errors={error?.graphQLErrors} networkError={error?.networkError} />;
  }
  if (!order) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>Order not found or you don't have access.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold mb-1">Order #{order.displayId}</h1>
          <div className="text-muted-foreground">
            <span>Created {new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <Button className="w-full sm:w-auto">
          View invoice <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-8 mb-8">
        {order.lineItems.map((item) => (
          <div key={item.id} className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            <div className="w-full lg:w-[300px] h-[200px] lg:h-[300px] relative bg-muted rounded-lg">
              {item.thumbnail && (
                <img 
                  src={item.thumbnail}
                  alt={item.title}
                  className="object-contain w-full h-full rounded-lg"
                />
              )}
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-xl font-medium">
                  {item.title}
                </h2>
                <div className="mt-1">
                  <p className="text-lg">
                    {item.total}
                    {item.quantity > 1 && (
                      <span className="text-muted-foreground">
                        {' '}({item.unitPrice} × {item.quantity})
                      </span>
                    )}
                  </p>
                  {item.originalPrice && item.percentageOff > 0 && (
                    <p className="text-sm text-muted-foreground line-through">
                      Original price: {item.originalPrice}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">Delivery address</h3>
                    <p className="text-muted-foreground">
                      {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}<br />
                      {order.shippingAddress?.address1}<br />
                      {order.shippingAddress?.city}, {order.shippingAddress?.province} {order.shippingAddress?.postalCode}
                    </p>
                  </div>
                  <EditDialog 
                    title="Edit Shipping Address"
                    listKey="Order"
                    id={order.id}
                    modifications={[{ key: 'shippingAddress' }]}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium mb-2">Shipping updates</h3>
                    <EditDialog 
                      title="Edit Contact Information"
                      listKey="Order"
                      id={order.id}
                      modifications={[{ key: 'email' }]}
                    />
                  </div>
                  <p className="text-muted-foreground">{order.email}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-2">
                  {item.fulfillmentStatus} {item.shippedAt ? `on ${new Date(item.shippedAt).toLocaleDateString()}` : ''}
                </p>
                <div className="space-y-2">
                  <Progress value={getProgressValue(item.fulfillmentStatus)} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Order placed</span>
                    <span className={item.fulfillmentStatus === 'processing' ? "font-medium" : "text-muted-foreground"}>Processing</span>
                    <span className={item.fulfillmentStatus === 'shipped' ? "font-medium" : "text-muted-foreground"}>Shipped</span>
                    <span className={item.fulfillmentStatus === 'delivered' ? "font-medium" : "text-muted-foreground"}>Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8 border-t">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-medium mb-4">Billing address</h3>
            <EditDialog 
              title="Edit Billing Address"
              listKey="Address"
              id={order.billingAddress.id}
              // modifications={[{ key: 'firstName' }]}
            />
          </div>
          <p className="text-muted-foreground">
            {order.billingAddress?.firstName} {order.billingAddress?.lastName}<br />
            {order.billingAddress?.company && <>{order.billingAddress.company}<br /></>}
            {order.billingAddress?.address1}<br />
            {order.billingAddress?.address2 && <>{order.billingAddress.address2}<br /></>}
            {order.billingAddress?.city}, {order.billingAddress?.province} {order.billingAddress?.postalCode}<br />
            {order.billingAddress?.countryCode}<br />
            {order.billingAddress?.phone}
          </p>
        </div>
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-medium mb-4">Payment information</h3>
            <EditDialog 
              title="Edit Payment Information"
              listKey="Order"
              id={order.id}
              modifications={[{ key: 'payments' }]}
            />
          </div>
          {order.payments?.map(payment => (
            <div key={payment.id} className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded mr-3 flex items-center justify-center text-primary-foreground text-xs">
                {payment.data?.brand || 'CARD'}
              </div>
              <div className="text-muted-foreground">
                <p>Ending with {payment.data?.last4 || '****'}</p>
                <p>{payment.status}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <h3 className="font-medium mb-4">Order summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping || '$0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{order.tax}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span>Order total</span>
              <span className="text-primary">{order.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 