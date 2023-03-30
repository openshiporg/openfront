-- CreateEnum
CREATE TYPE "OrderStatusType" AS ENUM ('pending', 'completed', 'archived', 'canceled', 'requires_action');

-- CreateEnum
CREATE TYPE "OrderFulfillmentStatusType" AS ENUM ('not_fulfilled', 'partially_fulfilled', 'fulfilled', 'partially_shipped', 'shipped', 'partially_returned', 'returned', 'canceled', 'requires_action');

-- CreateEnum
CREATE TYPE "OrderPaymentStatusType" AS ENUM ('not_paid', 'awaiting', 'captured', 'partially_refunded', 'refunded', 'canceled', 'requires_action');

-- CreateEnum
CREATE TYPE "ProductStatusType" AS ENUM ('draft', 'proposed', 'published', 'rejected');

-- CreateEnum
CREATE TYPE "CartTypeType" AS ENUM ('default', 'swap', 'draft_order', 'payment_link', 'claim');

-- CreateEnum
CREATE TYPE "ClaimOrderPaymentStatusType" AS ENUM ('na', 'not_refunded', 'refunded');

-- CreateEnum
CREATE TYPE "ClaimOrderFulfillmentStatusType" AS ENUM ('not_fulfilled', 'partially_fulfilled', 'fulfilled', 'partially_shipped', 'shipped', 'partially_returned', 'returned', 'canceled', 'requires_action');

-- CreateEnum
CREATE TYPE "ClaimOrderTypeType" AS ENUM ('refund', 'replace');

-- CreateEnum
CREATE TYPE "ClaimItemReasonType" AS ENUM ('missing_item', 'wrong_item', 'production_failure', 'other');

-- CreateEnum
CREATE TYPE "DiscountConditionTypeType" AS ENUM ('products', 'product_types', 'product_collections', 'product_tags', 'customer_groups');

-- CreateEnum
CREATE TYPE "DiscountConditionOperatorType" AS ENUM ('in', 'not_in');

-- CreateEnum
CREATE TYPE "DiscountRuleTypeType" AS ENUM ('fixed', 'percentage', 'free_shipping');

-- CreateEnum
CREATE TYPE "DiscountRuleAllocationType" AS ENUM ('total', 'item');

-- CreateEnum
CREATE TYPE "DraftOrderStatusType" AS ENUM ('open', 'completed');

-- CreateEnum
CREATE TYPE "InviteRoleType" AS ENUM ('admin', 'member', 'developer');

-- CreateEnum
CREATE TYPE "PaymentSessionStatusType" AS ENUM ('authorized', 'pending', 'requires_more', 'error', 'canceled');

-- CreateEnum
CREATE TYPE "PriceListTypeType" AS ENUM ('sale', 'override');

-- CreateEnum
CREATE TYPE "PriceListStatusType" AS ENUM ('active', 'draft');

-- CreateEnum
CREATE TYPE "RefundReasonType" AS ENUM ('discount', 'return', 'swap', 'claim', 'other');

-- CreateEnum
CREATE TYPE "ReturnStatusType" AS ENUM ('requested', 'received', 'requires_action', 'canceled');

-- CreateEnum
CREATE TYPE "ShippingOptionPriceTypeType" AS ENUM ('flat_rate', 'calculated');

-- CreateEnum
CREATE TYPE "ShippingOptionRequirementTypeType" AS ENUM ('min_subtotal', 'max_subtotal');

-- CreateEnum
CREATE TYPE "ShippingProfileTypeType" AS ENUM ('default', 'gift_card', 'custom');

-- CreateEnum
CREATE TYPE "SwapFulfillmentStatusType" AS ENUM ('not_fulfilled', 'fulfilled', 'shipped', 'partially_shipped', 'canceled', 'requires_action');

-- CreateEnum
CREATE TYPE "SwapPaymentStatusType" AS ENUM ('not_paid', 'awaiting', 'captured', 'confirmed', 'canceled', 'difference_refunded', 'partially_refunded', 'refunded', 'requires_action');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "password" TEXT,
    "role" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passwordResetToken" TEXT,
    "passwordResetIssuedAt" TIMESTAMP(3),
    "passwordResetRedeemedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "canReadOrders" BOOLEAN NOT NULL DEFAULT false,
    "canManageOrders" BOOLEAN NOT NULL DEFAULT false,
    "canReadProducts" BOOLEAN NOT NULL DEFAULT false,
    "canManageProducts" BOOLEAN NOT NULL DEFAULT false,
    "canReadFulfillments" BOOLEAN NOT NULL DEFAULT false,
    "canManageFulfillments" BOOLEAN NOT NULL DEFAULT false,
    "canReadUsers" BOOLEAN NOT NULL DEFAULT false,
    "canManageUsers" BOOLEAN NOT NULL DEFAULT false,
    "canReadRoles" BOOLEAN NOT NULL DEFAULT false,
    "canManageRoles" BOOLEAN NOT NULL DEFAULT false,
    "canReadCheckouts" BOOLEAN NOT NULL DEFAULT false,
    "canManageCheckouts" BOOLEAN NOT NULL DEFAULT false,
    "canReadDiscounts" BOOLEAN NOT NULL DEFAULT false,
    "canManageDiscounts" BOOLEAN NOT NULL DEFAULT false,
    "canReadGiftCards" BOOLEAN NOT NULL DEFAULT false,
    "canManageGiftCards" BOOLEAN NOT NULL DEFAULT false,
    "canReadReturns" BOOLEAN NOT NULL DEFAULT false,
    "canManageReturns" BOOLEAN NOT NULL DEFAULT false,
    "canReadSalesChannels" BOOLEAN NOT NULL DEFAULT false,
    "canManageSalesChannels" BOOLEAN NOT NULL DEFAULT false,
    "canReadPayments" BOOLEAN NOT NULL DEFAULT false,
    "canManagePayments" BOOLEAN NOT NULL DEFAULT false,
    "canReadIdempotencyKeys" BOOLEAN NOT NULL DEFAULT false,
    "canManageIdempotencyKeys" BOOLEAN NOT NULL DEFAULT false,
    "canReadApps" BOOLEAN NOT NULL DEFAULT false,
    "canManageApps" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "status" "OrderStatusType" NOT NULL DEFAULT 'pending',
    "fulfillmentStatus" "OrderFulfillmentStatusType" NOT NULL DEFAULT 'not_fulfilled',
    "paymentStatus" "OrderPaymentStatusType" NOT NULL DEFAULT 'not_paid',
    "displayId" INTEGER NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "taxRate" DOUBLE PRECISION,
    "canceledAt" TIMESTAMP(3),
    "metadata" JSONB,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "noNotification" BOOLEAN NOT NULL DEFAULT false,
    "externalId" TEXT NOT NULL DEFAULT '',
    "shippingAddress" TEXT,
    "billingAddress" TEXT,
    "currency" TEXT,
    "customer" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "thumbnail" TEXT NOT NULL DEFAULT '',
    "isGiftcard" BOOLEAN NOT NULL DEFAULT false,
    "shouldMerge" BOOLEAN NOT NULL DEFAULT true,
    "allowDiscounts" BOOLEAN NOT NULL DEFAULT true,
    "hasShipping" BOOLEAN NOT NULL DEFAULT false,
    "unitPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "fulfilledQuantity" INTEGER,
    "returnedQuantity" INTEGER,
    "shippedQuantity" INTEGER,
    "metadata" JSONB,
    "isReturn" BOOLEAN NOT NULL DEFAULT false,
    "claimOrder" TEXT,
    "cart" TEXT,
    "swap" TEXT,
    "order" TEXT,
    "productVariant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "subtitle" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "handle" TEXT NOT NULL DEFAULT '',
    "isGiftcard" BOOLEAN NOT NULL DEFAULT false,
    "thumbnail" TEXT NOT NULL DEFAULT '',
    "weight" INTEGER,
    "length" INTEGER,
    "height" INTEGER,
    "width" INTEGER,
    "hsCode" TEXT NOT NULL DEFAULT '',
    "originCountry" TEXT NOT NULL DEFAULT '',
    "midCode" TEXT NOT NULL DEFAULT '',
    "material" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "discountable" BOOLEAN NOT NULL DEFAULT true,
    "status" "ProductStatusType" NOT NULL DEFAULT 'draft',
    "externalId" TEXT NOT NULL DEFAULT '',
    "productCollection" TEXT,
    "shippingProfile" TEXT,
    "productType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCollection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "handle" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "handle" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "image_filesize" INTEGER,
    "image_extension" TEXT,
    "image_width" INTEGER,
    "image_height" INTEGER,
    "image_id" TEXT,
    "altText" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductOption" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "product" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductOptionValue" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "productVariant" TEXT,
    "productOption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductOptionValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTag" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductType" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "sku" TEXT NOT NULL DEFAULT '',
    "barcode" TEXT NOT NULL DEFAULT '',
    "ean" TEXT NOT NULL DEFAULT '',
    "upc" TEXT NOT NULL DEFAULT '',
    "inventoryQuantity" INTEGER NOT NULL,
    "allowBackorder" BOOLEAN NOT NULL DEFAULT false,
    "manageInventory" BOOLEAN NOT NULL DEFAULT true,
    "hsCode" TEXT NOT NULL DEFAULT '',
    "originCountry" TEXT NOT NULL DEFAULT '',
    "midCode" TEXT NOT NULL DEFAULT '',
    "material" TEXT NOT NULL DEFAULT '',
    "weight" INTEGER,
    "length" INTEGER,
    "height" INTEGER,
    "width" INTEGER,
    "metadata" JSONB,
    "variantRank" INTEGER DEFAULT 0,
    "product" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT '',
    "amountRefunded" INTEGER NOT NULL DEFAULT 0,
    "paymentProvider" TEXT NOT NULL DEFAULT '',
    "data" JSONB,
    "capturedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "metadata" JSONB,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "swap" TEXT,
    "currency" TEXT,
    "order" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT '',
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "address1" TEXT NOT NULL DEFAULT '',
    "address2" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "countryCode" TEXT NOT NULL DEFAULT '',
    "province" TEXT NOT NULL DEFAULT '',
    "postalCode" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "country" TEXT,
    "customer" TEXT,
    "cart" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "type" "CartTypeType" NOT NULL DEFAULT 'default',
    "metadata" JSONB,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "context" JSONB,
    "paymentAuthorizedAt" TIMESTAMP(3),
    "customer" TEXT,
    "region" TEXT,
    "draftOrder" TEXT,
    "order" TEXT,
    "swap" TEXT,
    "payment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "user" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimOrder" (
    "id" TEXT NOT NULL,
    "paymentStatus" "ClaimOrderPaymentStatusType" NOT NULL DEFAULT 'na',
    "fulfillmentStatus" "ClaimOrderFulfillmentStatusType" NOT NULL DEFAULT 'not_fulfilled',
    "type" "ClaimOrderTypeType" NOT NULL,
    "refundAmount" INTEGER,
    "canceledAt" TIMESTAMP(3),
    "metadata" JSONB,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "noNotification" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT,
    "order" TEXT,
    "return" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimItem" (
    "id" TEXT NOT NULL,
    "reason" "ClaimItemReasonType" NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "quantity" INTEGER NOT NULL,
    "metadata" JSONB,
    "productVariant" TEXT,
    "lineItem" TEXT,
    "claimOrder" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimImage" (
    "id" TEXT NOT NULL,
    "image_filesize" INTEGER,
    "image_extension" TEXT,
    "image_width" INTEGER,
    "image_height" INTEGER,
    "image_id" TEXT,
    "altText" TEXT NOT NULL DEFAULT '',
    "claimItem" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimTag" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "iso2" TEXT NOT NULL DEFAULT '',
    "iso3" TEXT NOT NULL DEFAULT '',
    "numCode" INTEGER NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "displayName" TEXT NOT NULL DEFAULT '',
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "symbol" TEXT NOT NULL DEFAULT '',
    "symbolNative" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "billingAddress" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "hasAccount" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomShippingOption" (
    "id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "metadata" JSONB,
    "shippingOption" TEXT,
    "cart" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomShippingOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "isDynamic" BOOLEAN NOT NULL DEFAULT false,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "metadata" JSONB,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "validDuration" TEXT NOT NULL DEFAULT '',
    "discountRule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountCondition" (
    "id" TEXT NOT NULL,
    "type" "DiscountConditionTypeType" NOT NULL,
    "operator" "DiscountConditionOperatorType" NOT NULL,
    "metadata" JSONB,
    "discountRule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountRule" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" "DiscountRuleTypeType" NOT NULL,
    "value" INTEGER NOT NULL,
    "allocation" "DiscountRuleAllocationType",
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftOrder" (
    "id" TEXT NOT NULL,
    "status" "DraftOrderStatusType" NOT NULL DEFAULT 'open',
    "displayId" INTEGER NOT NULL,
    "canceledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "noNotificationOrder" BOOLEAN NOT NULL DEFAULT false,
    "order" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DraftOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fulfillment" (
    "id" TEXT NOT NULL,
    "trackingNumbers" JSONB DEFAULT '"[]"',
    "data" JSONB,
    "shippedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "metadata" JSONB,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "noNotification" BOOLEAN NOT NULL DEFAULT false,
    "swap" TEXT,
    "fulfillmentProvider" TEXT,
    "claimOrder" TEXT,
    "order" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fulfillment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FulfillmentItem" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "fulfillment" TEXT,
    "lineItem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FulfillmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FulfillmentProvider" (
    "id" TEXT NOT NULL,
    "isInstalled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FulfillmentProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "value" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "endsAt" TIMESTAMP(3),
    "metadata" JSONB,
    "order" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCardTransaction" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "isTaxable" BOOLEAN NOT NULL DEFAULT false,
    "taxRate" DOUBLE PRECISION,
    "giftCard" TEXT,
    "order" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftCardTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "requestMethod" TEXT NOT NULL DEFAULT '',
    "requestParams" JSONB,
    "requestPath" TEXT NOT NULL DEFAULT '',
    "responseCode" INTEGER,
    "responseBody" JSONB,
    "recoveryPoint" TEXT NOT NULL DEFAULT 'started',
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL DEFAULT '',
    "role" "InviteRoleType" DEFAULT 'member',
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "token" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineItemAdjustment" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "amount" INTEGER NOT NULL,
    "metadata" JSONB,
    "discount" TEXT,
    "lineItem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineItemAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineItemTaxLine" (
    "id" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "code" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "lineItem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineItemTaxLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoneyAmount" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "minQuantity" INTEGER,
    "maxQuantity" INTEGER,
    "productVariant" TEXT,
    "region" TEXT,
    "currency" TEXT,
    "priceList" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoneyAmount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "resourceType" TEXT NOT NULL DEFAULT '',
    "resourceId" TEXT NOT NULL DEFAULT '',
    "authorId" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL DEFAULT '',
    "resourceType" TEXT NOT NULL DEFAULT '',
    "resourceId" TEXT NOT NULL DEFAULT '',
    "to" TEXT NOT NULL DEFAULT '',
    "data" JSONB,
    "parentId" TEXT NOT NULL DEFAULT '',
    "notificationProvider" TEXT,
    "customer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationProvider" (
    "id" TEXT NOT NULL,
    "isInstalled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuth" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT '',
    "applicationName" TEXT NOT NULL DEFAULT '',
    "installUrl" TEXT NOT NULL DEFAULT '',
    "uninstallUrl" TEXT NOT NULL DEFAULT '',
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentProvider" (
    "id" TEXT NOT NULL,
    "isInstalled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSession" (
    "id" TEXT NOT NULL,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "status" "PaymentSessionStatusType" NOT NULL,
    "data" JSONB,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "cart" TEXT,
    "paymentProvider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "type" "PriceListTypeType" NOT NULL DEFAULT 'sale',
    "status" "PriceListStatusType" NOT NULL DEFAULT 'draft',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "reason" "RefundReasonType" NOT NULL,
    "metadata" JSONB,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "order" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "taxRate" DOUBLE PRECISION NOT NULL,
    "taxCode" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "giftCardsTaxable" BOOLEAN NOT NULL DEFAULT true,
    "automaticTaxes" BOOLEAN NOT NULL DEFAULT true,
    "currency" TEXT,
    "taxProvider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Return" (
    "id" TEXT NOT NULL,
    "status" "ReturnStatusType" NOT NULL DEFAULT 'requested',
    "shippingData" JSONB,
    "refundAmount" INTEGER NOT NULL,
    "receivedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "noNotification" BOOLEAN NOT NULL DEFAULT false,
    "swap" TEXT,
    "order" TEXT,
    "shippingMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Return_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnItem" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isRequested" BOOLEAN NOT NULL DEFAULT true,
    "requestedQuantity" INTEGER,
    "receivedQuantity" INTEGER,
    "metadata" JSONB,
    "note" TEXT NOT NULL DEFAULT '',
    "return" TEXT,
    "lineItem" TEXT,
    "returnReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnReason" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "label" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "parentReturnReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingMethod" (
    "id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "data" JSONB,
    "order" TEXT,
    "claimOrder" TEXT,
    "cart" TEXT,
    "swap" TEXT,
    "shippingOption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingMethodTaxLine" (
    "id" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "code" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "shippingMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingMethodTaxLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "priceType" "ShippingOptionPriceTypeType" NOT NULL,
    "amount" INTEGER,
    "isReturn" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "metadata" JSONB,
    "adminOnly" BOOLEAN NOT NULL DEFAULT false,
    "region" TEXT,
    "fulfillmentProvider" TEXT,
    "shippingProfile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingOptionRequirement" (
    "id" TEXT NOT NULL,
    "type" "ShippingOptionRequirementTypeType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "shippingOption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingOptionRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "type" "ShippingProfileTypeType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Openfront Store',
    "defaultCurrencyCode" TEXT NOT NULL DEFAULT 'usd',
    "metadata" JSONB,
    "swapLinkTemplate" TEXT NOT NULL DEFAULT '',
    "paymentLinkTemplate" TEXT NOT NULL DEFAULT '',
    "inviteLinkTemplate" TEXT NOT NULL DEFAULT '',
    "currency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Swap" (
    "id" TEXT NOT NULL,
    "fulfillmentStatus" "SwapFulfillmentStatusType" NOT NULL,
    "paymentStatus" "SwapPaymentStatusType" NOT NULL,
    "differenceDue" INTEGER,
    "confirmedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "noNotification" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "allowBackorder" BOOLEAN NOT NULL DEFAULT false,
    "order" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Swap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxProvider" (
    "id" TEXT NOT NULL,
    "isInstalled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TaxProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "rate" DOUBLE PRECISION,
    "code" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingLink" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "trackingNumber" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "fulfillment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Product_productCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Product_productImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Product_productTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Product_taxRates" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductType_taxRates" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Cart_discounts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Cart_giftCards" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ClaimItem_claimTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Customer_customerGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CustomerGroup_discountConditions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CustomerGroup_priceLists" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Discount_regions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Discount_orders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DiscountCondition_products" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DiscountCondition_productCollections" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DiscountCondition_productCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DiscountCondition_productTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DiscountCondition_productTypes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DiscountRule_products" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_FulfillmentProvider_regions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Notification_otherNotifications" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PaymentProvider_regions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ShippingOption_taxRates" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Order_shippingAddress_idx" ON "Order"("shippingAddress");

-- CreateIndex
CREATE INDEX "Order_billingAddress_idx" ON "Order"("billingAddress");

-- CreateIndex
CREATE INDEX "Order_currency_idx" ON "Order"("currency");

-- CreateIndex
CREATE INDEX "Order_customer_idx" ON "Order"("customer");

-- CreateIndex
CREATE INDEX "Order_region_idx" ON "Order"("region");

-- CreateIndex
CREATE INDEX "LineItem_claimOrder_idx" ON "LineItem"("claimOrder");

-- CreateIndex
CREATE INDEX "LineItem_cart_idx" ON "LineItem"("cart");

-- CreateIndex
CREATE INDEX "LineItem_swap_idx" ON "LineItem"("swap");

-- CreateIndex
CREATE INDEX "LineItem_order_idx" ON "LineItem"("order");

-- CreateIndex
CREATE INDEX "LineItem_productVariant_idx" ON "LineItem"("productVariant");

-- CreateIndex
CREATE INDEX "Product_productCollection_idx" ON "Product"("productCollection");

-- CreateIndex
CREATE INDEX "Product_shippingProfile_idx" ON "Product"("shippingProfile");

-- CreateIndex
CREATE INDEX "Product_productType_idx" ON "Product"("productType");

-- CreateIndex
CREATE INDEX "ProductOption_product_idx" ON "ProductOption"("product");

-- CreateIndex
CREATE INDEX "ProductOptionValue_productVariant_idx" ON "ProductOptionValue"("productVariant");

-- CreateIndex
CREATE INDEX "ProductOptionValue_productOption_idx" ON "ProductOptionValue"("productOption");

-- CreateIndex
CREATE INDEX "ProductVariant_product_idx" ON "ProductVariant"("product");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_swap_key" ON "Payment"("swap");

-- CreateIndex
CREATE INDEX "Payment_currency_idx" ON "Payment"("currency");

-- CreateIndex
CREATE INDEX "Payment_order_idx" ON "Payment"("order");

-- CreateIndex
CREATE INDEX "Address_country_idx" ON "Address"("country");

-- CreateIndex
CREATE INDEX "Address_customer_idx" ON "Address"("customer");

-- CreateIndex
CREATE INDEX "Address_cart_idx" ON "Address"("cart");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_draftOrder_key" ON "Cart"("draftOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_order_key" ON "Cart"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_swap_key" ON "Cart"("swap");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_payment_key" ON "Cart"("payment");

-- CreateIndex
CREATE INDEX "Cart_customer_idx" ON "Cart"("customer");

-- CreateIndex
CREATE INDEX "Cart_region_idx" ON "Cart"("region");

-- CreateIndex
CREATE INDEX "ApiKey_user_idx" ON "ApiKey"("user");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimOrder_return_key" ON "ClaimOrder"("return");

-- CreateIndex
CREATE INDEX "ClaimOrder_address_idx" ON "ClaimOrder"("address");

-- CreateIndex
CREATE INDEX "ClaimOrder_order_idx" ON "ClaimOrder"("order");

-- CreateIndex
CREATE INDEX "ClaimItem_productVariant_idx" ON "ClaimItem"("productVariant");

-- CreateIndex
CREATE INDEX "ClaimItem_lineItem_idx" ON "ClaimItem"("lineItem");

-- CreateIndex
CREATE INDEX "ClaimItem_claimOrder_idx" ON "ClaimItem"("claimOrder");

-- CreateIndex
CREATE INDEX "ClaimImage_claimItem_idx" ON "ClaimImage"("claimItem");

-- CreateIndex
CREATE UNIQUE INDEX "Country_iso2_key" ON "Country"("iso2");

-- CreateIndex
CREATE INDEX "Country_region_idx" ON "Country"("region");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_billingAddress_key" ON "Customer"("billingAddress");

-- CreateIndex
CREATE INDEX "CustomShippingOption_shippingOption_idx" ON "CustomShippingOption"("shippingOption");

-- CreateIndex
CREATE INDEX "CustomShippingOption_cart_idx" ON "CustomShippingOption"("cart");

-- CreateIndex
CREATE INDEX "Discount_discountRule_idx" ON "Discount"("discountRule");

-- CreateIndex
CREATE INDEX "DiscountCondition_discountRule_idx" ON "DiscountCondition"("discountRule");

-- CreateIndex
CREATE UNIQUE INDEX "DraftOrder_order_key" ON "DraftOrder"("order");

-- CreateIndex
CREATE INDEX "Fulfillment_swap_idx" ON "Fulfillment"("swap");

-- CreateIndex
CREATE INDEX "Fulfillment_fulfillmentProvider_idx" ON "Fulfillment"("fulfillmentProvider");

-- CreateIndex
CREATE INDEX "Fulfillment_claimOrder_idx" ON "Fulfillment"("claimOrder");

-- CreateIndex
CREATE INDEX "Fulfillment_order_idx" ON "Fulfillment"("order");

-- CreateIndex
CREATE INDEX "FulfillmentItem_fulfillment_idx" ON "FulfillmentItem"("fulfillment");

-- CreateIndex
CREATE INDEX "FulfillmentItem_lineItem_idx" ON "FulfillmentItem"("lineItem");

-- CreateIndex
CREATE INDEX "GiftCard_order_idx" ON "GiftCard"("order");

-- CreateIndex
CREATE INDEX "GiftCard_region_idx" ON "GiftCard"("region");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_giftCard_idx" ON "GiftCardTransaction"("giftCard");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_order_idx" ON "GiftCardTransaction"("order");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_idempotencyKey_key" ON "IdempotencyKey"("idempotencyKey");

-- CreateIndex
CREATE INDEX "LineItemAdjustment_discount_idx" ON "LineItemAdjustment"("discount");

-- CreateIndex
CREATE INDEX "LineItemAdjustment_lineItem_idx" ON "LineItemAdjustment"("lineItem");

-- CreateIndex
CREATE INDEX "LineItemTaxLine_lineItem_idx" ON "LineItemTaxLine"("lineItem");

-- CreateIndex
CREATE INDEX "MoneyAmount_productVariant_idx" ON "MoneyAmount"("productVariant");

-- CreateIndex
CREATE INDEX "MoneyAmount_region_idx" ON "MoneyAmount"("region");

-- CreateIndex
CREATE INDEX "MoneyAmount_currency_idx" ON "MoneyAmount"("currency");

-- CreateIndex
CREATE INDEX "MoneyAmount_priceList_idx" ON "MoneyAmount"("priceList");

-- CreateIndex
CREATE INDEX "Notification_notificationProvider_idx" ON "Notification"("notificationProvider");

-- CreateIndex
CREATE INDEX "Notification_customer_idx" ON "Notification"("customer");

-- CreateIndex
CREATE UNIQUE INDEX "OAuth_applicationName_key" ON "OAuth"("applicationName");

-- CreateIndex
CREATE INDEX "PaymentSession_cart_idx" ON "PaymentSession"("cart");

-- CreateIndex
CREATE INDEX "PaymentSession_paymentProvider_idx" ON "PaymentSession"("paymentProvider");

-- CreateIndex
CREATE INDEX "Refund_order_idx" ON "Refund"("order");

-- CreateIndex
CREATE INDEX "Region_currency_idx" ON "Region"("currency");

-- CreateIndex
CREATE INDEX "Region_taxProvider_idx" ON "Region"("taxProvider");

-- CreateIndex
CREATE UNIQUE INDEX "Return_swap_key" ON "Return"("swap");

-- CreateIndex
CREATE UNIQUE INDEX "Return_shippingMethod_key" ON "Return"("shippingMethod");

-- CreateIndex
CREATE INDEX "Return_order_idx" ON "Return"("order");

-- CreateIndex
CREATE INDEX "ReturnItem_return_idx" ON "ReturnItem"("return");

-- CreateIndex
CREATE INDEX "ReturnItem_lineItem_idx" ON "ReturnItem"("lineItem");

-- CreateIndex
CREATE INDEX "ReturnItem_returnReason_idx" ON "ReturnItem"("returnReason");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnReason_value_key" ON "ReturnReason"("value");

-- CreateIndex
CREATE INDEX "ReturnReason_parentReturnReason_idx" ON "ReturnReason"("parentReturnReason");

-- CreateIndex
CREATE INDEX "ShippingMethod_order_idx" ON "ShippingMethod"("order");

-- CreateIndex
CREATE INDEX "ShippingMethod_claimOrder_idx" ON "ShippingMethod"("claimOrder");

-- CreateIndex
CREATE INDEX "ShippingMethod_cart_idx" ON "ShippingMethod"("cart");

-- CreateIndex
CREATE INDEX "ShippingMethod_swap_idx" ON "ShippingMethod"("swap");

-- CreateIndex
CREATE INDEX "ShippingMethod_shippingOption_idx" ON "ShippingMethod"("shippingOption");

-- CreateIndex
CREATE INDEX "ShippingMethodTaxLine_shippingMethod_idx" ON "ShippingMethodTaxLine"("shippingMethod");

-- CreateIndex
CREATE INDEX "ShippingOption_region_idx" ON "ShippingOption"("region");

-- CreateIndex
CREATE INDEX "ShippingOption_fulfillmentProvider_idx" ON "ShippingOption"("fulfillmentProvider");

-- CreateIndex
CREATE INDEX "ShippingOption_shippingProfile_idx" ON "ShippingOption"("shippingProfile");

-- CreateIndex
CREATE INDEX "ShippingOptionRequirement_shippingOption_idx" ON "ShippingOptionRequirement"("shippingOption");

-- CreateIndex
CREATE INDEX "Store_currency_idx" ON "Store"("currency");

-- CreateIndex
CREATE INDEX "Swap_order_idx" ON "Swap"("order");

-- CreateIndex
CREATE INDEX "Swap_address_idx" ON "Swap"("address");

-- CreateIndex
CREATE INDEX "TaxRate_region_idx" ON "TaxRate"("region");

-- CreateIndex
CREATE INDEX "TrackingLink_fulfillment_idx" ON "TrackingLink"("fulfillment");

-- CreateIndex
CREATE UNIQUE INDEX "_Product_productCategories_AB_unique" ON "_Product_productCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_Product_productCategories_B_index" ON "_Product_productCategories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Product_productImages_AB_unique" ON "_Product_productImages"("A", "B");

-- CreateIndex
CREATE INDEX "_Product_productImages_B_index" ON "_Product_productImages"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Product_productTags_AB_unique" ON "_Product_productTags"("A", "B");

-- CreateIndex
CREATE INDEX "_Product_productTags_B_index" ON "_Product_productTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Product_taxRates_AB_unique" ON "_Product_taxRates"("A", "B");

-- CreateIndex
CREATE INDEX "_Product_taxRates_B_index" ON "_Product_taxRates"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductType_taxRates_AB_unique" ON "_ProductType_taxRates"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductType_taxRates_B_index" ON "_ProductType_taxRates"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Cart_discounts_AB_unique" ON "_Cart_discounts"("A", "B");

-- CreateIndex
CREATE INDEX "_Cart_discounts_B_index" ON "_Cart_discounts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Cart_giftCards_AB_unique" ON "_Cart_giftCards"("A", "B");

-- CreateIndex
CREATE INDEX "_Cart_giftCards_B_index" ON "_Cart_giftCards"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClaimItem_claimTags_AB_unique" ON "_ClaimItem_claimTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ClaimItem_claimTags_B_index" ON "_ClaimItem_claimTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Customer_customerGroups_AB_unique" ON "_Customer_customerGroups"("A", "B");

-- CreateIndex
CREATE INDEX "_Customer_customerGroups_B_index" ON "_Customer_customerGroups"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CustomerGroup_discountConditions_AB_unique" ON "_CustomerGroup_discountConditions"("A", "B");

-- CreateIndex
CREATE INDEX "_CustomerGroup_discountConditions_B_index" ON "_CustomerGroup_discountConditions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CustomerGroup_priceLists_AB_unique" ON "_CustomerGroup_priceLists"("A", "B");

-- CreateIndex
CREATE INDEX "_CustomerGroup_priceLists_B_index" ON "_CustomerGroup_priceLists"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Discount_regions_AB_unique" ON "_Discount_regions"("A", "B");

-- CreateIndex
CREATE INDEX "_Discount_regions_B_index" ON "_Discount_regions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Discount_orders_AB_unique" ON "_Discount_orders"("A", "B");

-- CreateIndex
CREATE INDEX "_Discount_orders_B_index" ON "_Discount_orders"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DiscountCondition_products_AB_unique" ON "_DiscountCondition_products"("A", "B");

-- CreateIndex
CREATE INDEX "_DiscountCondition_products_B_index" ON "_DiscountCondition_products"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DiscountCondition_productCollections_AB_unique" ON "_DiscountCondition_productCollections"("A", "B");

-- CreateIndex
CREATE INDEX "_DiscountCondition_productCollections_B_index" ON "_DiscountCondition_productCollections"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DiscountCondition_productCategories_AB_unique" ON "_DiscountCondition_productCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_DiscountCondition_productCategories_B_index" ON "_DiscountCondition_productCategories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DiscountCondition_productTags_AB_unique" ON "_DiscountCondition_productTags"("A", "B");

-- CreateIndex
CREATE INDEX "_DiscountCondition_productTags_B_index" ON "_DiscountCondition_productTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DiscountCondition_productTypes_AB_unique" ON "_DiscountCondition_productTypes"("A", "B");

-- CreateIndex
CREATE INDEX "_DiscountCondition_productTypes_B_index" ON "_DiscountCondition_productTypes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DiscountRule_products_AB_unique" ON "_DiscountRule_products"("A", "B");

-- CreateIndex
CREATE INDEX "_DiscountRule_products_B_index" ON "_DiscountRule_products"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FulfillmentProvider_regions_AB_unique" ON "_FulfillmentProvider_regions"("A", "B");

-- CreateIndex
CREATE INDEX "_FulfillmentProvider_regions_B_index" ON "_FulfillmentProvider_regions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Notification_otherNotifications_AB_unique" ON "_Notification_otherNotifications"("A", "B");

-- CreateIndex
CREATE INDEX "_Notification_otherNotifications_B_index" ON "_Notification_otherNotifications"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PaymentProvider_regions_AB_unique" ON "_PaymentProvider_regions"("A", "B");

-- CreateIndex
CREATE INDEX "_PaymentProvider_regions_B_index" ON "_PaymentProvider_regions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ShippingOption_taxRates_AB_unique" ON "_ShippingOption_taxRates"("A", "B");

-- CreateIndex
CREATE INDEX "_ShippingOption_taxRates_B_index" ON "_ShippingOption_taxRates"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_fkey" FOREIGN KEY ("role") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingAddress_fkey" FOREIGN KEY ("shippingAddress") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_billingAddress_fkey" FOREIGN KEY ("billingAddress") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customer_fkey" FOREIGN KEY ("customer") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_region_fkey" FOREIGN KEY ("region") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_claimOrder_fkey" FOREIGN KEY ("claimOrder") REFERENCES "ClaimOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_cart_fkey" FOREIGN KEY ("cart") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_swap_fkey" FOREIGN KEY ("swap") REFERENCES "Swap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_productVariant_fkey" FOREIGN KEY ("productVariant") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productCollection_fkey" FOREIGN KEY ("productCollection") REFERENCES "ProductCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shippingProfile_fkey" FOREIGN KEY ("shippingProfile") REFERENCES "ShippingProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productType_fkey" FOREIGN KEY ("productType") REFERENCES "ProductType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_product_fkey" FOREIGN KEY ("product") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOptionValue" ADD CONSTRAINT "ProductOptionValue_productVariant_fkey" FOREIGN KEY ("productVariant") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOptionValue" ADD CONSTRAINT "ProductOptionValue_productOption_fkey" FOREIGN KEY ("productOption") REFERENCES "ProductOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_product_fkey" FOREIGN KEY ("product") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_swap_fkey" FOREIGN KEY ("swap") REFERENCES "Swap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_country_fkey" FOREIGN KEY ("country") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customer_fkey" FOREIGN KEY ("customer") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_cart_fkey" FOREIGN KEY ("cart") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_customer_fkey" FOREIGN KEY ("customer") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_region_fkey" FOREIGN KEY ("region") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_draftOrder_fkey" FOREIGN KEY ("draftOrder") REFERENCES "DraftOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_swap_fkey" FOREIGN KEY ("swap") REFERENCES "Swap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_payment_fkey" FOREIGN KEY ("payment") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimOrder" ADD CONSTRAINT "ClaimOrder_address_fkey" FOREIGN KEY ("address") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimOrder" ADD CONSTRAINT "ClaimOrder_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimOrder" ADD CONSTRAINT "ClaimOrder_return_fkey" FOREIGN KEY ("return") REFERENCES "Return"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimItem" ADD CONSTRAINT "ClaimItem_productVariant_fkey" FOREIGN KEY ("productVariant") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimItem" ADD CONSTRAINT "ClaimItem_lineItem_fkey" FOREIGN KEY ("lineItem") REFERENCES "LineItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimItem" ADD CONSTRAINT "ClaimItem_claimOrder_fkey" FOREIGN KEY ("claimOrder") REFERENCES "ClaimOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimImage" ADD CONSTRAINT "ClaimImage_claimItem_fkey" FOREIGN KEY ("claimItem") REFERENCES "ClaimItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_region_fkey" FOREIGN KEY ("region") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomShippingOption" ADD CONSTRAINT "CustomShippingOption_shippingOption_fkey" FOREIGN KEY ("shippingOption") REFERENCES "ShippingOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomShippingOption" ADD CONSTRAINT "CustomShippingOption_cart_fkey" FOREIGN KEY ("cart") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_discountRule_fkey" FOREIGN KEY ("discountRule") REFERENCES "DiscountRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCondition" ADD CONSTRAINT "DiscountCondition_discountRule_fkey" FOREIGN KEY ("discountRule") REFERENCES "DiscountRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftOrder" ADD CONSTRAINT "DraftOrder_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fulfillment" ADD CONSTRAINT "Fulfillment_swap_fkey" FOREIGN KEY ("swap") REFERENCES "Swap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fulfillment" ADD CONSTRAINT "Fulfillment_fulfillmentProvider_fkey" FOREIGN KEY ("fulfillmentProvider") REFERENCES "FulfillmentProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fulfillment" ADD CONSTRAINT "Fulfillment_claimOrder_fkey" FOREIGN KEY ("claimOrder") REFERENCES "ClaimOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fulfillment" ADD CONSTRAINT "Fulfillment_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FulfillmentItem" ADD CONSTRAINT "FulfillmentItem_fulfillment_fkey" FOREIGN KEY ("fulfillment") REFERENCES "Fulfillment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FulfillmentItem" ADD CONSTRAINT "FulfillmentItem_lineItem_fkey" FOREIGN KEY ("lineItem") REFERENCES "LineItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_region_fkey" FOREIGN KEY ("region") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCardTransaction" ADD CONSTRAINT "GiftCardTransaction_giftCard_fkey" FOREIGN KEY ("giftCard") REFERENCES "GiftCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCardTransaction" ADD CONSTRAINT "GiftCardTransaction_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItemAdjustment" ADD CONSTRAINT "LineItemAdjustment_discount_fkey" FOREIGN KEY ("discount") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItemAdjustment" ADD CONSTRAINT "LineItemAdjustment_lineItem_fkey" FOREIGN KEY ("lineItem") REFERENCES "LineItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItemTaxLine" ADD CONSTRAINT "LineItemTaxLine_lineItem_fkey" FOREIGN KEY ("lineItem") REFERENCES "LineItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyAmount" ADD CONSTRAINT "MoneyAmount_productVariant_fkey" FOREIGN KEY ("productVariant") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyAmount" ADD CONSTRAINT "MoneyAmount_region_fkey" FOREIGN KEY ("region") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyAmount" ADD CONSTRAINT "MoneyAmount_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyAmount" ADD CONSTRAINT "MoneyAmount_priceList_fkey" FOREIGN KEY ("priceList") REFERENCES "PriceList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_notificationProvider_fkey" FOREIGN KEY ("notificationProvider") REFERENCES "NotificationProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_customer_fkey" FOREIGN KEY ("customer") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSession" ADD CONSTRAINT "PaymentSession_cart_fkey" FOREIGN KEY ("cart") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSession" ADD CONSTRAINT "PaymentSession_paymentProvider_fkey" FOREIGN KEY ("paymentProvider") REFERENCES "PaymentProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_taxProvider_fkey" FOREIGN KEY ("taxProvider") REFERENCES "TaxProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_swap_fkey" FOREIGN KEY ("swap") REFERENCES "Swap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_shippingMethod_fkey" FOREIGN KEY ("shippingMethod") REFERENCES "ShippingMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_return_fkey" FOREIGN KEY ("return") REFERENCES "Return"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_lineItem_fkey" FOREIGN KEY ("lineItem") REFERENCES "LineItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_returnReason_fkey" FOREIGN KEY ("returnReason") REFERENCES "ReturnReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnReason" ADD CONSTRAINT "ReturnReason_parentReturnReason_fkey" FOREIGN KEY ("parentReturnReason") REFERENCES "ReturnReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingMethod" ADD CONSTRAINT "ShippingMethod_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingMethod" ADD CONSTRAINT "ShippingMethod_claimOrder_fkey" FOREIGN KEY ("claimOrder") REFERENCES "ClaimOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingMethod" ADD CONSTRAINT "ShippingMethod_cart_fkey" FOREIGN KEY ("cart") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingMethod" ADD CONSTRAINT "ShippingMethod_swap_fkey" FOREIGN KEY ("swap") REFERENCES "Swap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingMethod" ADD CONSTRAINT "ShippingMethod_shippingOption_fkey" FOREIGN KEY ("shippingOption") REFERENCES "ShippingOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingMethodTaxLine" ADD CONSTRAINT "ShippingMethodTaxLine_shippingMethod_fkey" FOREIGN KEY ("shippingMethod") REFERENCES "ShippingMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingOption" ADD CONSTRAINT "ShippingOption_region_fkey" FOREIGN KEY ("region") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingOption" ADD CONSTRAINT "ShippingOption_fulfillmentProvider_fkey" FOREIGN KEY ("fulfillmentProvider") REFERENCES "FulfillmentProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingOption" ADD CONSTRAINT "ShippingOption_shippingProfile_fkey" FOREIGN KEY ("shippingProfile") REFERENCES "ShippingProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingOptionRequirement" ADD CONSTRAINT "ShippingOptionRequirement_shippingOption_fkey" FOREIGN KEY ("shippingOption") REFERENCES "ShippingOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swap" ADD CONSTRAINT "Swap_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swap" ADD CONSTRAINT "Swap_address_fkey" FOREIGN KEY ("address") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_region_fkey" FOREIGN KEY ("region") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingLink" ADD CONSTRAINT "TrackingLink_fulfillment_fkey" FOREIGN KEY ("fulfillment") REFERENCES "Fulfillment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Product_productCategories" ADD CONSTRAINT "_Product_productCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Product_productCategories" ADD CONSTRAINT "_Product_productCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Product_productImages" ADD CONSTRAINT "_Product_productImages_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Product_productImages" ADD CONSTRAINT "_Product_productImages_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Product_productTags" ADD CONSTRAINT "_Product_productTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Product_productTags" ADD CONSTRAINT "_Product_productTags_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Product_taxRates" ADD CONSTRAINT "_Product_taxRates_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Product_taxRates" ADD CONSTRAINT "_Product_taxRates_B_fkey" FOREIGN KEY ("B") REFERENCES "TaxRate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductType_taxRates" ADD CONSTRAINT "_ProductType_taxRates_A_fkey" FOREIGN KEY ("A") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductType_taxRates" ADD CONSTRAINT "_ProductType_taxRates_B_fkey" FOREIGN KEY ("B") REFERENCES "TaxRate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Cart_discounts" ADD CONSTRAINT "_Cart_discounts_A_fkey" FOREIGN KEY ("A") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Cart_discounts" ADD CONSTRAINT "_Cart_discounts_B_fkey" FOREIGN KEY ("B") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Cart_giftCards" ADD CONSTRAINT "_Cart_giftCards_A_fkey" FOREIGN KEY ("A") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Cart_giftCards" ADD CONSTRAINT "_Cart_giftCards_B_fkey" FOREIGN KEY ("B") REFERENCES "GiftCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClaimItem_claimTags" ADD CONSTRAINT "_ClaimItem_claimTags_A_fkey" FOREIGN KEY ("A") REFERENCES "ClaimItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClaimItem_claimTags" ADD CONSTRAINT "_ClaimItem_claimTags_B_fkey" FOREIGN KEY ("B") REFERENCES "ClaimTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Customer_customerGroups" ADD CONSTRAINT "_Customer_customerGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Customer_customerGroups" ADD CONSTRAINT "_Customer_customerGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "CustomerGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerGroup_discountConditions" ADD CONSTRAINT "_CustomerGroup_discountConditions_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomerGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerGroup_discountConditions" ADD CONSTRAINT "_CustomerGroup_discountConditions_B_fkey" FOREIGN KEY ("B") REFERENCES "DiscountCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerGroup_priceLists" ADD CONSTRAINT "_CustomerGroup_priceLists_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomerGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerGroup_priceLists" ADD CONSTRAINT "_CustomerGroup_priceLists_B_fkey" FOREIGN KEY ("B") REFERENCES "PriceList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Discount_regions" ADD CONSTRAINT "_Discount_regions_A_fkey" FOREIGN KEY ("A") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Discount_regions" ADD CONSTRAINT "_Discount_regions_B_fkey" FOREIGN KEY ("B") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Discount_orders" ADD CONSTRAINT "_Discount_orders_A_fkey" FOREIGN KEY ("A") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Discount_orders" ADD CONSTRAINT "_Discount_orders_B_fkey" FOREIGN KEY ("B") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountCondition_products" ADD CONSTRAINT "_DiscountCondition_products_A_fkey" FOREIGN KEY ("A") REFERENCES "DiscountCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountCondition_products" ADD CONSTRAINT "_DiscountCondition_products_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountCondition_productCollections" ADD CONSTRAINT "_DiscountCondition_productCollections_A_fkey" FOREIGN KEY ("A") REFERENCES "DiscountCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountCondition_productCollections" ADD CONSTRAINT "_DiscountCondition_productCollections_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountCondition_productCategories" ADD CONSTRAINT "_DiscountCondition_productCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "DiscountCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountCondition_productCategories" ADD CONSTRAINT "_DiscountCondition_productCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountCondition_productTags" ADD CONSTRAINT "_DiscountCondition_productTags_A_fkey" FOREIGN KEY ("A") REFERENCES "DiscountCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountCondition_productTags" ADD CONSTRAINT "_DiscountCondition_productTags_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountCondition_productTypes" ADD CONSTRAINT "_DiscountCondition_productTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "DiscountCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountCondition_productTypes" ADD CONSTRAINT "_DiscountCondition_productTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountRule_products" ADD CONSTRAINT "_DiscountRule_products_A_fkey" FOREIGN KEY ("A") REFERENCES "DiscountRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountRule_products" ADD CONSTRAINT "_DiscountRule_products_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FulfillmentProvider_regions" ADD CONSTRAINT "_FulfillmentProvider_regions_A_fkey" FOREIGN KEY ("A") REFERENCES "FulfillmentProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FulfillmentProvider_regions" ADD CONSTRAINT "_FulfillmentProvider_regions_B_fkey" FOREIGN KEY ("B") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Notification_otherNotifications" ADD CONSTRAINT "_Notification_otherNotifications_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Notification_otherNotifications" ADD CONSTRAINT "_Notification_otherNotifications_B_fkey" FOREIGN KEY ("B") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentProvider_regions" ADD CONSTRAINT "_PaymentProvider_regions_A_fkey" FOREIGN KEY ("A") REFERENCES "PaymentProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentProvider_regions" ADD CONSTRAINT "_PaymentProvider_regions_B_fkey" FOREIGN KEY ("B") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShippingOption_taxRates" ADD CONSTRAINT "_ShippingOption_taxRates_A_fkey" FOREIGN KEY ("A") REFERENCES "ShippingOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShippingOption_taxRates" ADD CONSTRAINT "_ShippingOption_taxRates_B_fkey" FOREIGN KEY ("B") REFERENCES "TaxRate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
