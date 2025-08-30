"use client";

import * as React from "react";
import { useState, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  Package,
  MapPin,
  Truck,
  CreditCard,
  Check,
  CircleCheck,
  Search,
  Plus,
  Minus,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

// Types
interface MiniStorefrontProps {
  regionCode?: string;
  customerId?: string;
  onSuccess?: (orderId: string) => void;
}

interface CheckoutStep {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

const steps: CheckoutStep[] = [
  { id: "cart", name: "Create Cart", icon: ShoppingCart, completed: false },
  { id: "address", name: "Shipping Address", icon: MapPin, completed: false },
  { id: "delivery", name: "Delivery", icon: Truck, completed: false },
  { id: "payment", name: "Payment", icon: CreditCard, completed: false },
  { id: "review", name: "Review & Complete", icon: Check, completed: false },
];

export function MiniStorefront({ 
  regionCode = "us", 
  customerId,
  onSuccess 
}: MiniStorefrontProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState("cart");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  
  // State for data
  const [region, setRegion] = useState<any>(null);
  const [cart, setCart] = useState<any>({ 
    id: `temp-cart-${Date.now()}`,
    items: [],
    subtotal: 0,
    total: 0,
    shippingTotal: 0,
    taxTotal: 0
  });
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState("");
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState("");
  
  // Search debounce ref
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Form state (using checkout form structure)
  const [formData, setFormData] = useState({
    "shippingAddress.firstName": "",
    "shippingAddress.lastName": "",
    "shippingAddress.address1": "",
    "shippingAddress.company": "",
    "shippingAddress.postalCode": "",
    "shippingAddress.city": "",
    "shippingAddress.countryCode": regionCode,
    "shippingAddress.province": "",
    email: "",
    "shippingAddress.phone": "",
  });
  const [hasModifiedFields, setHasModifiedFields] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // Fetch initial data
  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open, regionCode]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Search products using client-side fetch
  const searchProducts = async (searchQuery: string = "") => {
    setIsSearching(true);
    try {
      const query = `
        query SearchProducts($search: String) {
          products(
            where: {
              OR: [
                { title: { contains: $search, mode: insensitive } }
                { handle: { contains: $search, mode: insensitive } }
              ]
            }
            take: 50
          ) {
            id
            title
            handle
            thumbnail
            productVariants {
              id
              title
              sku
              inventoryQuantity
              prices {
                id
                amount
                currency {
                  code
                }
                calculatedPrice {
                  calculatedAmount
                  originalAmount
                  currencyCode
                }
              }
            }
          }
        }
      `;

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query,
          variables: { search: searchQuery || "" }
        })
      });

      const result = await response.json();

      if (result.data) {
        setProducts(result.data.products || []);
        console.log(`Found ${result.data.products?.length || 0} products`);
      } else if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error in searchProducts:", error);
      setProducts([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      console.log("=== Fetching initial data ===");
      
      // Mock region data for now
      setRegion({ id: 'us', name: 'United States' });
      
      // Load initial products
      await searchProducts("");
      
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setProducts([]);
    }
  };

  // Add item to local cart state
  const addItemToCart = (product: any, variant: any) => {
    const newItem = {
      id: `${variant.id}-${Date.now()}`,
      title: `${product.title} - ${variant.title}`,
      quantity: 1,
      unitPrice: variant.prices?.[0]?.calculatedPrice?.calculatedAmount || variant.prices?.[0]?.amount || 0,
      subtotal: variant.prices?.[0]?.calculatedPrice?.calculatedAmount || variant.prices?.[0]?.amount || 0,
      variant: {
        id: variant.id,
        title: variant.title,
        product: {
          title: product.title
        }
      }
    };

    setCart(prevCart => {
      const updatedItems = [...prevCart.items, newItem];
      const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      
      return {
        ...prevCart,
        items: updatedItems,
        subtotal,
        total: subtotal, // For now, total = subtotal
      };
    });
  };

  // Add product to cart
  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedProduct) return;
    
    // Add to local cart state immediately
    addItemToCart(selectedProduct, selectedVariant);
    
    // Reset selections
    setSelectedProduct(null);
    setSelectedVariant(null);
    
    console.log("Item added to cart successfully");
  };

  // Submit shipping address
  const handleAddressSubmit = async () => {
    if (!cart) return;
    
    // Validate required fields
    const requiredFields = [
      'shippingAddress.firstName',
      'shippingAddress.lastName', 
      'shippingAddress.address1',
      'shippingAddress.city',
      'shippingAddress.postalCode',
      'email'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return;
    }
    
    startTransition(async () => {
      try {
        // For now, just store the address data locally
        console.log("Address data:", formData);
        
        // Mark step as completed and move to next
        setCompletedSteps(prev => new Set([...prev, "address"]));
        setActiveStep("delivery");
        
        // Mock shipping options for now
        setShippingOptions([
          { id: 'standard', name: 'Standard Shipping', amount: 1000, provider: { name: 'Standard' } },
          { id: 'express', name: 'Express Shipping', amount: 2000, provider: { name: 'Express' } }
        ]);
      } catch (error) {
        console.error("Error setting addresses:", error);
      }
    });
  };

  // Select shipping method
  const handleShippingSelect = async () => {
    if (!cart || !selectedShippingOptionId) return;
    
    startTransition(async () => {
      try {
        // Mark step as completed and move to next
        setCompletedSteps(prev => new Set([...prev, "delivery"]));
        setActiveStep("payment");
        
        // Mock payment methods
        setPaymentMethods([
          { id: 'stripe', name: 'Credit Card', description: 'Pay with credit card' },
          { id: 'manual', name: 'Cash on Delivery', description: 'Pay on delivery' }
        ]);
      } catch (error) {
        console.error("Error setting shipping method:", error);
      }
    });
  };

  // Set payment method
  const handlePaymentSelect = async () => {
    if (!cart || !selectedPaymentProvider) return;
    
    startTransition(async () => {
      try {
        // Mark step as completed and move to next
        setCompletedSteps(prev => new Set([...prev, "payment"]));
        setActiveStep("review");
      } catch (error) {
        console.error("Error setting payment method:", error);
      }
    });
  };

  // Complete order
  const handleCompleteOrder = async () => {
    if (!cart) return;
    
    startTransition(async () => {
      try {
        // Mock order creation - replace with actual API call
        const mockOrderId = `order-${Date.now()}`;
        
        if (onSuccess) {
          onSuccess(mockOrderId);
          setOpen(false);
        }
      } catch (error) {
        console.error("Error placing order:", error);
      }
    });
  };

  // Handle form input changes
  const handleChange = (e: any) => {
    setHasModifiedFields(true);

    // Handle both event objects (from Input) and direct values (from Select)
    if (e && typeof e === 'object' && e.target) {
      // Handle standard input events
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    } else if (e && typeof e === 'object' && 'name' in e && 'value' in e) {
      // Handle direct value objects with name property
      setFormData({
        ...formData,
        [e.name]: e.value,
      });
    }
  };

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search to avoid too many requests
    searchTimeoutRef.current = setTimeout(() => {
      searchProducts(value);
    }, 300);
  };

  // Use products directly since filtering is done server-side
  const filteredProducts = products;

  const renderStepContent = () => {
    switch (activeStep) {
      case "cart":
        return (
          <div className="space-y-4">
            <div className="flex gap-4 h-[300px]">
              {/* Product search column */}
              <div className="flex-1 space-y-4">
                <div className="relative">
                  {isSearching ? (
                    <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
                  ) : (
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  )}
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
                
                <ScrollArea className="h-[250px]">
                  <div className="space-y-2 pr-4">
                    {filteredProducts.length === 0 ? (
                      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        <div className="text-center">
                          <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p className="text-sm">
                            {searchTerm ? `No products found for "${searchTerm}"` : "No products available"}
                          </p>
                          {searchTerm && (
                            <p className="text-xs mt-2">Try a different search term</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-colors",
                            selectedProduct?.id === product.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                          onClick={() => {
                            setSelectedProduct(product);
                            setSelectedVariant(null);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {product.thumbnail && (
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium truncate">
                                {product.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {product.productVariants?.length || 0} variants
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Variant selection column */}
              <div className="flex-1 border-l pl-4">
                {selectedProduct ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">{selectedProduct.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedProduct.handle}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Select Variant</h4>
                      <ScrollArea className="h-[180px]">
                        <div className="space-y-2 pr-4">
                          {selectedProduct.productVariants?.map((variant: any) => (
                            <div
                              key={variant.id}
                              className={cn(
                                "p-3 rounded-md border cursor-pointer transition-colors",
                                selectedVariant?.id === variant.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              )}
                              onClick={() => setSelectedVariant(variant)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium">
                                    {variant.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    SKU: {variant.sku || "N/A"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">
                                    ${((variant.prices?.[0]?.calculatedPrice?.calculatedAmount || variant.prices?.[0]?.amount) / 100).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Stock: {variant.inventoryQuantity || 0}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <Button
                      className="w-full"
                      disabled={!selectedVariant}
                      onClick={handleAddToCart}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p className="text-sm">Select a product to view variants</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cart summary */}
            {cart?.items?.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Cart Items</h4>
                <div className="space-y-2">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.title || item.variant?.title || item.variant?.product?.title}</span>
                      <span className="text-muted-foreground">
                        {item.quantity}x ${((item.unitPrice || item.unit_price || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>${((cart.subtotal || 0) / 100).toFixed(2)}</span>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => {
                    setCompletedSteps(prev => new Set([...prev, "cart"]));
                    setActiveStep("address");
                  }}
                  disabled={!cart?.items?.length}
                >
                  Continue to Shipping
                </Button>
              </div>
            )}
          </div>
        );

      case "address":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First name"
                name="shippingAddress.firstName"
                autoComplete="given-name"
                value={formData["shippingAddress.firstName"]}
                onChange={handleChange}
                required
              />
              <Input
                placeholder="Last name"
                name="shippingAddress.lastName"
                autoComplete="family-name"
                value={formData["shippingAddress.lastName"]}
                onChange={handleChange}
                required
              />
              <Input
                placeholder="Address"
                name="shippingAddress.address1"
                autoComplete="address-line1"
                value={formData["shippingAddress.address1"]}
                onChange={handleChange}
                required
              />
              <Input
                placeholder="Company"
                name="shippingAddress.company"
                value={formData["shippingAddress.company"]}
                onChange={handleChange}
                autoComplete="organization"
              />
              <Input
                placeholder="City"
                name="shippingAddress.city"
                autoComplete="address-level2"
                value={formData["shippingAddress.city"]}
                onChange={handleChange}
                required
              />
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  placeholder="State / Province"
                  name="shippingAddress.province"
                  autoComplete="address-level1"
                  value={formData["shippingAddress.province"]}
                  onChange={handleChange}
                />
                <Input
                  placeholder="ZIP / Postal code"
                  name="shippingAddress.postalCode"
                  autoComplete="postal-code"
                  value={formData["shippingAddress.postalCode"]}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  title="Enter a valid email address."
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="shippingAddress.phone"
                  autoComplete="tel"
                  value={formData["shippingAddress.phone"]}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <Button
              className="w-full"
              onClick={handleAddressSubmit}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue to Delivery"
              )}
            </Button>
          </div>
        );

      case "delivery":
        return (
          <div className="space-y-4">
            <RadioGroup value={selectedShippingOptionId} onValueChange={setSelectedShippingOptionId}>
              {shippingOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-3 p-4 rounded-lg border">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.provider?.name || "Standard Shipping"}
                        </p>
                      </div>
                      <span className="font-medium">
                        ${(option.amount / 100).toFixed(2)}
                      </span>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <Button
              className="w-full"
              onClick={handleShippingSelect}
              disabled={isPending || !selectedShippingOptionId}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue to Payment"
              )}
            </Button>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-4">
            <RadioGroup value={selectedPaymentProvider} onValueChange={setSelectedPaymentProvider}>
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-3 p-4 rounded-lg border">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-medium">{method.name || method.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {method.description || "Payment provider"}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <Button
              className="w-full"
              onClick={handlePaymentSelect}
              disabled={isPending || !selectedPaymentProvider}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to Review"
              )}
            </Button>
          </div>
        );

      case "review":
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-medium">Order Summary</h3>
              
              {/* Items */}
              <div className="space-y-2">
                {cart?.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.title} x{item.quantity}</span>
                    <span>${(item.subtotal / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${(cart?.subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${(cart?.shipping_total / 100 || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${(cart?.tax_total / 100 || 0).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${(cart?.total / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <Button
              className="w-full"
              onClick={handleCompleteOrder}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Order...
                </>
              ) : (
                "Complete Order"
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // Get current steps with completion status
  const currentSteps = steps.map(step => ({
    ...step,
    completed: completedSteps.has(step.id),
  }));

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Package className="mr-2 h-4 w-4" />
        Create Order
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 md:max-h-[600px] md:max-w-[900px] lg:max-w-[1000px]">
          <DialogTitle className="sr-only">Create Draft Order</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new draft order by adding products and customer information.
          </DialogDescription>
          <SidebarProvider className="items-start">
            <Sidebar collapsible="none" className="hidden md:flex">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {currentSteps.map((step) => (
                        <SidebarMenuItem key={step.id}>
                          <SidebarMenuButton
                            asChild
                            isActive={activeStep === step.id}
                            onClick={() => {
                              if (step.completed || activeStep === step.id) {
                                setActiveStep(step.id);
                              }
                            }}
                            className={cn(
                              !step.completed && activeStep !== step.id && "opacity-50"
                            )}
                          >
                            <button>
                              {step.completed ? (
                                <CircleCheck className="text-primary" />
                              ) : (
                                <step.icon />
                              )}
                              <span>{step.name}</span>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <main className="flex h-[550px] flex-1 flex-col overflow-hidden">
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
                <div className="flex items-center gap-2 px-4">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="#">Draft Order</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {currentSteps.find(s => s.id === activeStep)?.name}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>
              <div className="flex-1 overflow-y-auto p-4 pt-0">
                {renderStepContent()}
              </div>
            </main>
          </SidebarProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}