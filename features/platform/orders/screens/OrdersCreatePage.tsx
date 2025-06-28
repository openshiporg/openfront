"use client";

import React from "react";
import Link from "next/link";
import { PageBreadcrumbs } from "@/features/dashboard/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, MapPin, Mail, Building, Phone, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CustomerSearchCombobox } from "../components/CustomerSearchCombobox";
import { AddressSelectCombobox } from "../components/AddressSelectCombobox";
import { LineItemsManager } from "../components/LineItemsManager";
import { AdminPaymentSelection } from "../components/AdminPaymentSelection";
import { CreateItemDrawer } from "@/features/dashboard/views/relationship/client/components/CreateItemDrawer";
import { getCustomer } from "../actions/customers";
import { getRegionByCountry, getActiveCartPaymentProviders } from "../actions/regions";

type LineItem = {
  id: string;
  variant: any;
  quantity: number;
  unitPrice: number;
  total: number;
};

export function OrdersCreatePage() {
  const router = useRouter();
  
  // Order state
  const [lineItems, setLineItems] = React.useState<LineItem[]>([]);
  const [isCreatingOrder, setIsCreatingOrder] = React.useState(false);
  
  // Customer and address management state
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = React.useState<string | null>(null);
  const [selectedShippingAddress, setSelectedShippingAddress] = React.useState<any>(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = React.useState<string | null>(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = React.useState<any>(null);
  const [sameAsShippingAddress, setSameAsShippingAddress] = React.useState(true);
  
  // Payment state
  const [availablePaymentMethods, setAvailablePaymentMethods] = React.useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>("");
  const [cartId, setCartId] = React.useState<string | null>(null);

  // Create drawer state
  const [createDrawerOpen, setCreateDrawerOpen] = React.useState(false);
  const [createDrawerListKey, setCreateDrawerListKey] = React.useState<string>("");

  // Handle customer selection
  const handleCustomerChange = (customerId: string | null) => {
    setSelectedCustomerId(customerId);
    setSelectedShippingAddressId(null);
    setSelectedShippingAddress(null);
    setSelectedBillingAddressId(null);
    setSelectedBillingAddress(null);
    
    if (customerId) {
      const fetchCustomer = async () => {
        const result = await getCustomer(customerId);
        if (result.success) {
          setSelectedCustomer(result.data);
        } else {
            toast.error("Error fetching customer");
        }
      };
      fetchCustomer();
    } else {
      setSelectedCustomer(null);
    }
  };

  // Handle shipping address selection
  const handleShippingAddressChange = async (addressId: string | null) => {
    setSelectedShippingAddressId(addressId);
    
    if (addressId && selectedCustomer) {
      const address = selectedCustomer.addresses?.find((addr: any) => addr.id === addressId);
      setSelectedShippingAddress(address || null);
      
      // If same as shipping is enabled, also set billing address
      if (sameAsShippingAddress) {
        setSelectedBillingAddressId(addressId);
        setSelectedBillingAddress(address || null);
      }

      // Fetch payment methods for the selected address's region
      if (address?.country?.iso2) {
        await fetchPaymentMethods(address.country.iso2);
      }
    } else {
      setSelectedShippingAddress(null);
      if (sameAsShippingAddress) {
        setSelectedBillingAddressId(null);
        setSelectedBillingAddress(null);
      }
      setAvailablePaymentMethods([]);
      setSelectedPaymentMethod("");
    }
  };

  // Fetch payment methods for a given country
  const fetchPaymentMethods = async (countryCode: string) => {
    const regionResult = await getRegionByCountry(countryCode);

    if (regionResult.success && regionResult.data) {
      const providersResult = await getActiveCartPaymentProviders(regionResult.data.id);
      if (providersResult.success) {
        const providers = providersResult.data || [];
        setAvailablePaymentMethods(providers);
        const manualProvider = providers.find((p: any) => p.code === 'manual');
        if (manualProvider) {
          setSelectedPaymentMethod('manual');
        }
      } else {
        toast.error("Error fetching payment methods");
      }
    } else {
        toast.error("Error fetching region");
    }
  };

  // Handle billing address selection
  const handleBillingAddressChange = (addressId: string | null) => {
    setSelectedBillingAddressId(addressId);
    
    if (addressId && selectedCustomer) {
      const address = selectedCustomer.addresses?.find((addr: any) => addr.id === addressId);
      setSelectedBillingAddress(address || null);
    } else {
      setSelectedBillingAddress(null);
    }
  };

  // Handle same as shipping toggle
  const handleSameAsShippingChange = (checked: boolean) => {
    setSameAsShippingAddress(checked);
    
    if (checked && selectedShippingAddress) {
      setSelectedBillingAddressId(selectedShippingAddressId);
      setSelectedBillingAddress(selectedShippingAddress);
    } else {
      setSelectedBillingAddressId(null);
      setSelectedBillingAddress(null);
    }
  };

  // Handle new address creation
  const handleAddressCreated = (newAddress: any) => {
    if (selectedCustomer) {
      setSelectedCustomer((prev: any) => ({
        ...prev,
        addresses: [...(prev.addresses || []), newAddress]
      }));
    }
  };

  // Handle creating new customer via CreateItemDrawer
  const handleCreateCustomer = () => {
    setCreateDrawerListKey("User");
    setCreateDrawerOpen(true);
  };

  // Handle creating new address via CreateItemDrawer
  const handleCreateAddress = () => {
    if (!selectedCustomerId) return;
    setCreateDrawerListKey("Address");
    setCreateDrawerOpen(true);
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setCreateDrawerOpen(false);
    setCreateDrawerListKey("");
  };

  // Handle successful creation from drawer
  const handleItemCreated = (data: Record<string, unknown>) => {
    const item = data as { id: string; label?: string };
    // If we created a customer, select them
    if (createDrawerListKey === "User") {
      handleCustomerChange(item.id);
    }
    // If we created an address and have a selected customer, refresh customer data
    if (createDrawerListKey === "Address" && selectedCustomerId) {
      handleCustomerChange(selectedCustomerId);
    }
    handleDrawerClose();
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const shippingCost = 5.00; // Placeholder
  const taxAmount = subtotal * 0.1; // 10% tax placeholder
  const total = subtotal + shippingCost + taxAmount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleCreateCart = async () => {
    if (!selectedCustomer || !selectedShippingAddress || lineItems.length === 0) {
      toast.error("Missing required data for cart creation");
      return;
    }

    const { createOrderCart, createAdminCartPaymentSessions } = await import('../actions/orders');

    const result = await createOrderCart({
      customerId: selectedCustomer.id,
      shippingAddressId: selectedShippingAddress.id,
      billingAddressId: selectedBillingAddress?.id || selectedShippingAddress.id,
      lineItems: lineItems.map(item => ({
        variantId: item.variant.id,
        quantity: item.quantity
      }))
    });

    if (result.success && result.data) {
      setCartId(result.data.cartId);
      await createAdminCartPaymentSessions(result.data.cartId);
      toast.success("Cart created successfully");
    } else {
      toast.error(result.error || "Failed to create cart");
    }
  };

  const handlePlaceOrder = async () => {
    if (!cartId || !selectedPaymentMethod) {
      console.error("Missing cart ID or payment method");
      return;
    }

    setIsCreatingOrder(true);

    try {
      // Import admin server actions
      const { initiateAdminPaymentSession, completeAdminCart } = await import('../actions/orders');
      
      // Step 1: Initiate payment session using admin server action
      await initiateAdminPaymentSession(cartId, selectedPaymentMethod);

      // Step 2: Complete the cart using admin server action
      const completeResult = await completeAdminCart(cartId);
      
      if (!completeResult.success) {
        throw new Error(completeResult.error || "Failed to complete order");
      }

      // The completeActiveCart mutation returns the order directly
      const order = completeResult.data.completeActiveCart;
      
      if (!order) {
        throw new Error("Failed to complete order");
      }
      
      // Show success message and redirect
      toast.success(`Order #${order.displayId} created successfully!`);
      
      // Redirect to the order details page
      router.push(`/dashboard/platform/orders/${order.id}`);

    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(`Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <>
      <PageBreadcrumbs
        items={[
          { type: 'link', label: 'Dashboard', href: '/' },
          { type: 'page', label: 'Platform' },
          { type: 'link', label: 'Orders', href: '/dashboard/platform/orders' },
          { type: 'page', label: 'Create Order' },
        ]}
      />
      <div className="bg-muted/5">
        <div className="max-w-6xl p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Button variant="link" className="p-0 h-5">
                <Link
                  href="/dashboard/platform/orders"
                  className="flex items-center text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Orders
                </Link>
              </Button>
            </div>
          <h1 className="text-2xl font-semibold">Create Order</h1>
          <p className="text-sm text-muted-foreground">
            Create a new order for a customer
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Line Items */}
            <LineItemsManager
              lineItems={lineItems}
              onLineItemsChange={setLineItems}
            />

            {/* Payment Selection */}
            {cartId && availablePaymentMethods.length > 0 && (
              <Card className="bg-muted/10">
                <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
                  <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <AdminPaymentSelection
                    availablePaymentMethods={availablePaymentMethods}
                    selectedPaymentMethod={selectedPaymentMethod}
                    onPaymentMethodChange={setSelectedPaymentMethod}
                    onSubmit={handlePlaceOrder}
                    isLoading={isCreatingOrder}
                  />
                </CardContent>
              </Card>
            )}

            {/* Payment Processing */}
            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-3 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Total</span>
                    <span>{formatPrice(taxAmount)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Total Paid</span>
                    <span>€0.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Customer Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Customer Selection */}
            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <CustomerSearchCombobox
                  value={selectedCustomerId || undefined}
                  onValueChange={handleCustomerChange}
                  selectedCustomer={selectedCustomer}
                  label=""
                  placeholder="Search customers..."
                  className="space-y-0"
                  onCreateCustomer={handleCreateCustomer}
                />
                {selectedCustomer && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-3 text-foreground/75">
                      <User className="h-4 w-4" />
                      <span className="text-sm">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-foreground/75">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">
                        {selectedCustomer.phone || "No phone number"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-foreground/75">
                      <ShoppingBag className="h-4 w-4" />
                      <span className="text-sm">
                        {selectedCustomer.orders?.length || 0} Orders
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-2 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {selectedCustomer ? (
                  <AddressSelectCombobox
                    addresses={selectedCustomer.addresses || []}
                    value={selectedShippingAddressId || undefined}
                    onValueChange={handleShippingAddressChange}
                    selectedAddress={selectedShippingAddress}
                    label=""
                    placeholder="Search addresses..."
                    customerId={selectedCustomerId || undefined}
                    onAddressCreated={handleAddressCreated}
                    onCreateAddress={handleCreateAddress}
                    className="space-y-0"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a customer first
                  </p>
                )}
                {selectedShippingAddress && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-3 text-foreground/75">
                      <User className="h-4 w-4" />
                      <span className="text-sm">
                        {selectedShippingAddress.firstName} {selectedShippingAddress.lastName}
                      </span>
                    </div>
                    {selectedShippingAddress.company && (
                      <div className="flex items-center space-x-3 text-foreground/75">
                        <Building className="h-4 w-4" />
                        <span className="text-sm">
                          {selectedShippingAddress.company}
                        </span>
                      </div>
                    )}
                    <div className="flex items-start space-x-3 text-foreground/75">
                      <MapPin className="h-4 w-4" />
                      <div className="flex flex-col text-sm">
                        <span>{selectedShippingAddress.address1}</span>
                        {selectedShippingAddress.address2 && (
                          <span>{selectedShippingAddress.address2}</span>
                        )}
                        <span>
                          {[
                            selectedShippingAddress.city,
                            selectedShippingAddress.province,
                            selectedShippingAddress.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                        <span>{selectedShippingAddress.country?.name}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="same-as-shipping"
                    checked={sameAsShippingAddress}
                    onCheckedChange={handleSameAsShippingChange}
                  />
                  <Label htmlFor="same-as-shipping" className="text-sm">
                    Same as shipping address
                  </Label>
                </div>
                
                {!sameAsShippingAddress && selectedCustomer ? (
                  <AddressSelectCombobox
                    addresses={selectedCustomer.addresses || []}
                    value={selectedBillingAddressId || undefined}
                    onValueChange={handleBillingAddressChange}
                    selectedAddress={selectedBillingAddress}
                    label=""
                    placeholder="Search addresses..."
                    customerId={selectedCustomerId || undefined}
                    onAddressCreated={handleAddressCreated}
                    onCreateAddress={handleCreateAddress}
                    className="space-y-0"
                  />
                ) : sameAsShippingAddress && selectedShippingAddress ? (
                  <p className="text-sm text-foreground/75">
                    Same as shipping address
                  </p>
                ) : !selectedCustomer ? (
                  <p className="text-sm text-muted-foreground">
                    Select a customer first
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a shipping address first
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Create Cart Button */}
            {selectedCustomer && selectedShippingAddress && lineItems.length > 0 && !cartId && (
              <Button 
                onClick={handleCreateCart}
                className="w-full"
                size="lg"
              >
                Create Cart
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Create Item Drawer */}
      {createDrawerListKey && (
        <CreateItemDrawer
          listKey={createDrawerListKey}
          isOpen={createDrawerOpen}
          onClose={handleDrawerClose}
          onCreate={handleItemCreated}
        />
      )}
    </div>
    </>
  );
} 