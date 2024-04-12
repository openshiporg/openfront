const data = {
  data: {
    __schema: {
      queryType: { name: "Query" },
      mutationType: { name: "Mutation" },
      types: [
        {
          name: "User",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "name",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "email",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "password",
              args: [],
              type: { name: "PasswordState", kind: "OBJECT" },
            },
            { name: "role", args: [], type: { name: "Role", kind: "OBJECT" } },
            {
              name: "apiKeys",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ApiKeyWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "apiKeysCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "passwordResetToken",
              args: [],
              type: { name: "PasswordState", kind: "OBJECT" },
            },
            {
              name: "passwordResetIssuedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "passwordResetRedeemedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "ID", kind: "SCALAR", fields: null },
        { name: "String", kind: "SCALAR", fields: null },
        { name: "Int", kind: "SCALAR", fields: null },
        {
          name: "PasswordState",
          kind: "OBJECT",
          fields: [
            { name: "isSet", args: [], type: { name: null, kind: "NON_NULL" } },
          ],
        },
        { name: "Boolean", kind: "SCALAR", fields: null },
        { name: "DateTime", kind: "SCALAR", fields: null },
        { name: "UserWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "UserWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "IDFilter", kind: "INPUT_OBJECT", fields: null },
        { name: "StringFilter", kind: "INPUT_OBJECT", fields: null },
        { name: "QueryMode", kind: "ENUM", fields: null },
        { name: "NestedStringFilter", kind: "INPUT_OBJECT", fields: null },
        { name: "PasswordFilter", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ApiKeyManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "DateTimeFilter", kind: "INPUT_OBJECT", fields: null },
        { name: "DateTimeNullableFilter", kind: "INPUT_OBJECT", fields: null },
        { name: "UserOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "OrderDirection", kind: "ENUM", fields: null },
        { name: "UserUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "RoleRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ApiKeyRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "UserUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "UserCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "RoleRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ApiKeyRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "Role",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "name",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "canReadOrders",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canManageOrders",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canReadProducts",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canManageProducts",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canReadFulfillments",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canManageFulfillments",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canReadUsers",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canManageUsers",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canReadRoles",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canManageRoles",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canReadCheckouts",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canManageCheckouts",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canReadDiscounts",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canManageDiscounts",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canReadGiftCards",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canManageGiftCards",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canReadReturns",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canManageReturns",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canReadSalesChannels",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canManageSalesChannels",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canReadPayments",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canManagePayments",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canReadIdempotencyKeys",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canManageIdempotencyKeys",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canReadApps",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canManageApps",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "assignedTo",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "UserWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "assignedToCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "RoleWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "RoleWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "BooleanFilter", kind: "INPUT_OBJECT", fields: null },
        { name: "UserManyRelationFilter", kind: "INPUT_OBJECT", fields: null },
        { name: "RoleOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "RoleUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "UserRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "RoleUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "RoleCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "UserRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "Order",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "status",
              args: [],
              type: { name: "OrderStatusType", kind: "ENUM" },
            },
            {
              name: "fulfillmentStatus",
              args: [],
              type: { name: "OrderFulfillmentStatusType", kind: "ENUM" },
            },
            {
              name: "paymentStatus",
              args: [],
              type: { name: "OrderPaymentStatusType", kind: "ENUM" },
            },
            {
              name: "displayId",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "email",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "taxRate",
              args: [],
              type: { name: "Float", kind: "SCALAR" },
            },
            {
              name: "canceledAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "idempotencyKey",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "noNotification",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "externalId",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "shippingAddress",
              args: [],
              type: { name: "Address", kind: "OBJECT" },
            },
            {
              name: "billingAddress",
              args: [],
              type: { name: "Address", kind: "OBJECT" },
            },
            {
              name: "currency",
              args: [],
              type: { name: "Currency", kind: "OBJECT" },
            },
            {
              name: "draftOrder",
              args: [],
              type: { name: "DraftOrder", kind: "OBJECT" },
            },
            { name: "cart", args: [], type: { name: "Cart", kind: "OBJECT" } },
            {
              name: "customer",
              args: [],
              type: { name: "Customer", kind: "OBJECT" },
            },
            {
              name: "region",
              args: [],
              type: { name: "Region", kind: "OBJECT" },
            },
            {
              name: "claimOrders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ClaimOrderWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "claimOrdersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "fulfillments",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "FulfillmentWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "fulfillmentsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "giftCards",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "GiftCardWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "giftCardsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "giftCardTransactions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "GiftCardTransactionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "giftCardTransactionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "lineItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "LineItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "lineItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "discounts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discountsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "payments",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "PaymentWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "paymentsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "refunds",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "RefundWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "refundsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "returns",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ReturnWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "returnsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "shippingMethods",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingMethodWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingMethodsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "swaps",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "SwapWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "swapsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "Float", kind: "SCALAR", fields: null },
        { name: "OrderStatusType", kind: "ENUM", fields: null },
        { name: "OrderFulfillmentStatusType", kind: "ENUM", fields: null },
        { name: "OrderPaymentStatusType", kind: "ENUM", fields: null },
        { name: "OrderWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "OrderWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "OrderStatusTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "OrderFulfillmentStatusTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "OrderPaymentStatusTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "IntFilter", kind: "INPUT_OBJECT", fields: null },
        { name: "FloatNullableFilter", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ClaimOrderManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "GiftCardManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "GiftCardTransactionManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "RefundManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ReturnManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "SwapManyRelationFilter", kind: "INPUT_OBJECT", fields: null },
        { name: "OrderOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "OrderUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "AddressRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CurrencyRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DraftOrderRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CartRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomerRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "RegionRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimOrderRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "GiftCardRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "GiftCardTransactionRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "RefundRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ReturnRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "SwapRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "OrderUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "OrderCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "AddressRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CurrencyRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DraftOrderRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CartRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomerRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "RegionRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimOrderRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "GiftCardRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "GiftCardTransactionRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "RefundRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ReturnRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "SwapRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItem",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "title",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "thumbnail",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "isGiftcard",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "shouldMerge",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "allowDiscounts",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "hasShipping",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "unitPrice",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "quantity",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "fulfilledQuantity",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "returnedQuantity",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "shippedQuantity",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "isReturn",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "claimOrder",
              args: [],
              type: { name: "ClaimOrder", kind: "OBJECT" },
            },
            { name: "cart", args: [], type: { name: "Cart", kind: "OBJECT" } },
            { name: "swap", args: [], type: { name: "Swap", kind: "OBJECT" } },
            {
              name: "order",
              args: [],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "productVariant",
              args: [],
              type: { name: "ProductVariant", kind: "OBJECT" },
            },
            {
              name: "claimItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ClaimItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "claimItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "fulfillmentItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "FulfillmentItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "fulfillmentItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "lineItemAdjustments",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "LineItemAdjustmentWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "lineItemAdjustmentsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "lineItemTaxLines",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "LineItemTaxLineWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "lineItemTaxLinesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "returnItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ReturnItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "returnItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "LineItemWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "LineItemWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "IntNullableFilter", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ClaimItemManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentItemManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemAdjustmentManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemTaxLineManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ReturnItemManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "LineItemOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "LineItemUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ClaimOrderRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "SwapRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "OrderRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductVariantRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimItemRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentItemRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemAdjustmentRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemTaxLineRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ReturnItemRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "LineItemUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "LineItemCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ClaimOrderRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "SwapRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "OrderRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductVariantRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimItemRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentItemRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemAdjustmentRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemTaxLineRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ReturnItemRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "Product",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "title",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "subtitle",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "handle",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "isGiftcard",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "thumbnail",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            { name: "weight", args: [], type: { name: "Int", kind: "SCALAR" } },
            { name: "length", args: [], type: { name: "Int", kind: "SCALAR" } },
            { name: "height", args: [], type: { name: "Int", kind: "SCALAR" } },
            { name: "width", args: [], type: { name: "Int", kind: "SCALAR" } },
            {
              name: "hsCode",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "originCountry",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "midCode",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "material",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "discountable",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "status",
              args: [],
              type: { name: "ProductStatusType", kind: "ENUM" },
            },
            {
              name: "externalId",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "productCollection",
              args: [],
              type: { name: "ProductCollection", kind: "OBJECT" },
            },
            {
              name: "productCategories",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductCategoryWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productCategoriesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "shippingProfile",
              args: [],
              type: { name: "ShippingProfile", kind: "OBJECT" },
            },
            {
              name: "productType",
              args: [],
              type: { name: "ProductType", kind: "OBJECT" },
            },
            {
              name: "discountConditions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountConditionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discountConditionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "discountRules",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountRuleWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discountRulesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productImages",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductImageWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productImagesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productOptions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductOptionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productOptionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productTags",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductTagWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productTagsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "taxRates",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "TaxRateWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "taxRatesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productVariants",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductVariantWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productVariantsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "ProductStatusType", kind: "ENUM", fields: null },
        { name: "ProductWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ProductWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ProductStatusTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCategoryManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountConditionManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountRuleManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductImageManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductTagManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "TaxRateManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductVariantManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ProductOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ProductUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ProductCollectionRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCategoryRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingProfileRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductTypeRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountConditionRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountRuleRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductImageRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductTagRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "TaxRateRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductVariantRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ProductUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "ProductCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ProductCollectionRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCategoryRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingProfileRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductTypeRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountConditionRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountRuleRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductImageRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductTagRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "TaxRateRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductVariantRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCollection",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "title",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "handle",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "discountConditions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountConditionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discountConditionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "products",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ProductCollectionWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCollectionWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCollectionOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCollectionUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCollectionUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCollectionCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCategory",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "title",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "handle",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "isInternal",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "isActive",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "discountConditions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountConditionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discountConditionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "products",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ProductCategoryWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCategoryWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCategoryOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCategoryUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCategoryUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCategoryCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductImage",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "image",
              args: [],
              type: { name: "ImageFieldOutput", kind: "OBJECT" },
            },
            {
              name: "altText",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "products",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ImageFieldOutput",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "filesize",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            { name: "width", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "height",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "extension",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            { name: "url", args: [], type: { name: null, kind: "NON_NULL" } },
          ],
        },
        { name: "ImageExtension", kind: "ENUM", fields: null },
        {
          name: "ProductImageWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ProductImageWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ProductImageOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ProductImageUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ImageFieldInput", kind: "INPUT_OBJECT", fields: null },
        { name: "Upload", kind: "SCALAR", fields: null },
        { name: "ProductImageUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "ProductImageCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ProductOption",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "title",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "product",
              args: [],
              type: { name: "Product", kind: "OBJECT" },
            },
            {
              name: "productOptionValues",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductOptionValueWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productOptionValuesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ProductOptionWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ProductOptionWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ProductOptionValueManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionValueRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ProductOptionUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ProductOptionCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionValueRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionValue",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "value",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "productVariant",
              args: [],
              type: { name: "ProductVariant", kind: "OBJECT" },
            },
            {
              name: "productOption",
              args: [],
              type: { name: "ProductOption", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ProductOptionValueWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionValueWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionValueOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionValueUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionValueUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionValueCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductOptionRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductTag",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "value",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "discountConditions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountConditionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discountConditionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "products",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ProductTagWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ProductTagWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ProductTagOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ProductTagUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ProductTagUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "ProductTagCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ProductType",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "value",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "discountConditions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountConditionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discountConditionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "products",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "taxRates",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "TaxRateWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "taxRatesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ProductTypeWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ProductTypeWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ProductTypeOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ProductTypeUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ProductTypeUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "ProductTypeCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ProductVariant",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "title",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            { name: "sku", args: [], type: { name: "String", kind: "SCALAR" } },
            {
              name: "barcode",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            { name: "ean", args: [], type: { name: "String", kind: "SCALAR" } },
            { name: "upc", args: [], type: { name: "String", kind: "SCALAR" } },
            {
              name: "inventoryQuantity",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "allowBackorder",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "manageInventory",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "hsCode",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "originCountry",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "midCode",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "material",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            { name: "weight", args: [], type: { name: "Int", kind: "SCALAR" } },
            { name: "length", args: [], type: { name: "Int", kind: "SCALAR" } },
            { name: "height", args: [], type: { name: "Int", kind: "SCALAR" } },
            { name: "width", args: [], type: { name: "Int", kind: "SCALAR" } },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "variantRank",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "product",
              args: [],
              type: { name: "Product", kind: "OBJECT" },
            },
            {
              name: "claimItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ClaimItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "claimItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "lineItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "LineItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "lineItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "moneyAmounts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "MoneyAmountWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "moneyAmountsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productOptionValues",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductOptionValueWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productOptionValuesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ProductVariantWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductVariantWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "MoneyAmountManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductVariantOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductVariantUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "MoneyAmountRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductVariantUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductVariantCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "MoneyAmountRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "Payment",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            { name: "amount", args: [], type: { name: "Int", kind: "SCALAR" } },
            {
              name: "currencyCode",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "amountRefunded",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "paymentProvider",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            { name: "data", args: [], type: { name: "JSON", kind: "SCALAR" } },
            {
              name: "capturedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "canceledAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "idempotencyKey",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            { name: "cart", args: [], type: { name: "Cart", kind: "OBJECT" } },
            { name: "swap", args: [], type: { name: "Swap", kind: "OBJECT" } },
            {
              name: "currency",
              args: [],
              type: { name: "Currency", kind: "OBJECT" },
            },
            {
              name: "order",
              args: [],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "PaymentWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "PaymentWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "PaymentOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "PaymentUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "PaymentUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "PaymentCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "Address",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "company",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "firstName",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "lastName",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "address1",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "address2",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "city",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "countryCode",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "province",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "postalCode",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "phone",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "country",
              args: [],
              type: { name: "Country", kind: "OBJECT" },
            },
            {
              name: "customer",
              args: [],
              type: { name: "Customer", kind: "OBJECT" },
            },
            { name: "cart", args: [], type: { name: "Cart", kind: "OBJECT" } },
            {
              name: "claimOrders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ClaimOrderWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "claimOrdersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "ordersUsingAsBillingAddress",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "OrderWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "ordersUsingAsBillingAddressCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "ordersUsingAsShippingAddress",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "OrderWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "ordersUsingAsShippingAddressCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "swaps",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "SwapWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "swapsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "AddressWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "AddressWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "OrderManyRelationFilter", kind: "INPUT_OBJECT", fields: null },
        { name: "AddressOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "AddressUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "CountryRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "OrderRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "AddressUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "AddressCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "CountryRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "OrderRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "Cart",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "email",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "type",
              args: [],
              type: { name: "CartTypeType", kind: "ENUM" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "idempotencyKey",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "context",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "paymentAuthorizedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "customer",
              args: [],
              type: { name: "Customer", kind: "OBJECT" },
            },
            {
              name: "region",
              args: [],
              type: { name: "Region", kind: "OBJECT" },
            },
            {
              name: "addresses",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "AddressWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "addressesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "discounts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discountsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "giftCards",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "GiftCardWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "giftCardsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "draftOrder",
              args: [],
              type: { name: "DraftOrder", kind: "OBJECT" },
            },
            {
              name: "order",
              args: [],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "lineItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "LineItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "lineItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "customShippingOptions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "CustomShippingOptionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "customShippingOptionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            { name: "swap", args: [], type: { name: "Swap", kind: "OBJECT" } },
            {
              name: "shippingMethods",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingMethodWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingMethodsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "payment",
              args: [],
              type: { name: "Payment", kind: "OBJECT" },
            },
            {
              name: "paymentSessions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "PaymentSessionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "paymentSessionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "CartTypeType", kind: "ENUM", fields: null },
        { name: "CartWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "CartWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "CartTypeTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "AddressManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomShippingOptionManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentSessionManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "CartOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "CartUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "AddressRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomShippingOptionRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentSessionRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "CartUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "CartCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "AddressRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomShippingOptionRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentSessionRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ApiKey",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            { name: "user", args: [], type: { name: "User", kind: "OBJECT" } },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "ApiKeyWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ApiKeyWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ApiKeyOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ApiKeyUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "UserRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ApiKeyUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "ApiKeyCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "UserRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimOrder",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "paymentStatus",
              args: [],
              type: { name: "ClaimOrderPaymentStatusType", kind: "ENUM" },
            },
            {
              name: "fulfillmentStatus",
              args: [],
              type: { name: "ClaimOrderFulfillmentStatusType", kind: "ENUM" },
            },
            {
              name: "type",
              args: [],
              type: { name: "ClaimOrderTypeType", kind: "ENUM" },
            },
            {
              name: "refundAmount",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "canceledAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "idempotencyKey",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "noNotification",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "address",
              args: [],
              type: { name: "Address", kind: "OBJECT" },
            },
            {
              name: "order",
              args: [],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "claimItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ClaimItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "claimItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "fulfillments",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "FulfillmentWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "fulfillmentsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "lineItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "LineItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "lineItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "return",
              args: [],
              type: { name: "Return", kind: "OBJECT" },
            },
            {
              name: "shippingMethods",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingMethodWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingMethodsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "ClaimOrderPaymentStatusType", kind: "ENUM", fields: null },
        { name: "ClaimOrderFulfillmentStatusType", kind: "ENUM", fields: null },
        { name: "ClaimOrderTypeType", kind: "ENUM", fields: null },
        {
          name: "ClaimOrderWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ClaimOrderWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ClaimOrderPaymentStatusTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimOrderFulfillmentStatusTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimOrderTypeTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ClaimOrderOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ClaimOrderUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ReturnRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ClaimOrderUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "ClaimOrderCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ReturnRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimItem",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "reason",
              args: [],
              type: { name: "ClaimItemReasonType", kind: "ENUM" },
            },
            {
              name: "note",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "quantity",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "productVariant",
              args: [],
              type: { name: "ProductVariant", kind: "OBJECT" },
            },
            {
              name: "lineItem",
              args: [],
              type: { name: "LineItem", kind: "OBJECT" },
            },
            {
              name: "claimOrder",
              args: [],
              type: { name: "ClaimOrder", kind: "OBJECT" },
            },
            {
              name: "claimImages",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ClaimImageWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "claimImagesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "claimTags",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ClaimTagWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "claimTagsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "ClaimItemReasonType", kind: "ENUM", fields: null },
        {
          name: "ClaimItemWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ClaimItemWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ClaimItemReasonTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimImageManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimTagManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ClaimItemOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ClaimItemUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "LineItemRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimImageRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimTagRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ClaimItemUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "ClaimItemCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "LineItemRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimImageRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimTagRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimImage",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "image",
              args: [],
              type: { name: "ImageFieldOutput", kind: "OBJECT" },
            },
            {
              name: "altText",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "claimItem",
              args: [],
              type: { name: "ClaimItem", kind: "OBJECT" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ClaimImageWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ClaimImageWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ClaimImageOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ClaimImageUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ClaimItemRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ClaimImageUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "ClaimImageCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ClaimItemRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ClaimTag",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "value",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "claimItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ClaimItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "claimItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ClaimTagWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ClaimTagWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ClaimTagOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ClaimTagUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ClaimTagUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "ClaimTagCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "Country",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "iso2",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "iso3",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "numCode",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "name",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "displayName",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "region",
              args: [],
              type: { name: "Region", kind: "OBJECT" },
            },
            {
              name: "addresses",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "AddressWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "addressesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "CountryWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "CountryWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "CountryOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "CountryUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "CountryUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "CountryCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "Currency",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "code",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "symbol",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "symbolNative",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "name",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "moneyAmounts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "MoneyAmountWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "moneyAmountsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "orders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "OrderWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "ordersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "payments",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "PaymentWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "paymentsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "regions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "RegionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "regionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "stores",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "StoreWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "storesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "CurrencyWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "CurrencyWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "RegionManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "StoreManyRelationFilter", kind: "INPUT_OBJECT", fields: null },
        { name: "CurrencyOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "CurrencyUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "RegionRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "StoreRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "CurrencyUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "CurrencyCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "RegionRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "StoreRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "Customer",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "email",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "firstName",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "lastName",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "billingAddress",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "password",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "phone",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "hasAccount",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "addresses",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "AddressWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "addressesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "orders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "OrderWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "ordersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "carts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "CartWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "cartsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "customerGroups",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "CustomerGroupWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "customerGroupsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "notifications",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "NotificationWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "notificationsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "CustomerWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "CustomerWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "CartManyRelationFilter", kind: "INPUT_OBJECT", fields: null },
        {
          name: "CustomerGroupManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "NotificationManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "CustomerOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "CustomerUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "CartRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomerGroupRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "NotificationRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "CustomerUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "CustomerCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "CartRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomerGroupRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "NotificationRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomerGroup",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "name",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "customers",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "CustomerWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "customersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "discountConditions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountConditionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discountConditionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "priceLists",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "PriceListWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "priceListsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "CustomerGroupWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "CustomerGroupWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "CustomerManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PriceListManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomerGroupOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomerGroupUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomerRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PriceListRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "CustomerGroupUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        {
          name: "CustomerGroupCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomerRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PriceListRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomShippingOption",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            { name: "price", args: [], type: { name: "Int", kind: "SCALAR" } },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "shippingOption",
              args: [],
              type: { name: "ShippingOption", kind: "OBJECT" },
            },
            { name: "cart", args: [], type: { name: "Cart", kind: "OBJECT" } },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "CustomShippingOptionWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomShippingOptionWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomShippingOptionOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomShippingOptionUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomShippingOptionUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "CustomShippingOptionCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "Discount",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "code",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "isDynamic",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "isDisabled",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "startsAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "endsAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "usageLimit",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "usageCount",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "validDuration",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "discountRule",
              args: [],
              type: { name: "DiscountRule", kind: "OBJECT" },
            },
            {
              name: "carts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "CartWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "cartsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "lineItemAdjustments",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "LineItemAdjustmentWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "lineItemAdjustmentsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "regions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "RegionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "regionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "orders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "OrderWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "ordersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "DiscountWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "DiscountWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "DiscountOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "DiscountUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "DiscountRuleRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "DiscountUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "DiscountCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "DiscountRuleRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountCondition",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "type",
              args: [],
              type: { name: "DiscountConditionTypeType", kind: "ENUM" },
            },
            {
              name: "operator",
              args: [],
              type: { name: "DiscountConditionOperatorType", kind: "ENUM" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "discountRule",
              args: [],
              type: { name: "DiscountRule", kind: "OBJECT" },
            },
            {
              name: "customerGroups",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "CustomerGroupWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "customerGroupsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "products",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productCollections",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductCollectionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productCollectionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productCategories",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductCategoryWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productCategoriesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productTags",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductTagWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productTagsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productTypes",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductTypeWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productTypesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "DiscountConditionTypeType", kind: "ENUM", fields: null },
        { name: "DiscountConditionOperatorType", kind: "ENUM", fields: null },
        {
          name: "DiscountConditionWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountConditionWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountConditionTypeTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountConditionOperatorTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCollectionManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductTypeManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountConditionOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountConditionUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCollectionRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductTypeRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountConditionUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountConditionCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductCollectionRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ProductTypeRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountRule",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "type",
              args: [],
              type: { name: "DiscountRuleTypeType", kind: "ENUM" },
            },
            { name: "value", args: [], type: { name: "Int", kind: "SCALAR" } },
            {
              name: "allocation",
              args: [],
              type: { name: "DiscountRuleAllocationType", kind: "ENUM" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "discounts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discountsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "discountConditions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountConditionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discountConditionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "products",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "DiscountRuleTypeType", kind: "ENUM", fields: null },
        { name: "DiscountRuleAllocationType", kind: "ENUM", fields: null },
        {
          name: "DiscountRuleWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "DiscountRuleWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "DiscountRuleTypeTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountRuleAllocationTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountRuleOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "DiscountRuleUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "DiscountRuleUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "DiscountRuleCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "DraftOrder",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "status",
              args: [],
              type: { name: "DraftOrderStatusType", kind: "ENUM" },
            },
            {
              name: "displayId",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "canceledAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "completedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "idempotencyKey",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "noNotificationOrder",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            { name: "cart", args: [], type: { name: "Cart", kind: "OBJECT" } },
            {
              name: "order",
              args: [],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "DraftOrderStatusType", kind: "ENUM", fields: null },
        {
          name: "DraftOrderWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "DraftOrderWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "DraftOrderStatusTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "DraftOrderOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "DraftOrderUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "DraftOrderUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "DraftOrderCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "Fulfillment",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "trackingNumbers",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            { name: "data", args: [], type: { name: "JSON", kind: "SCALAR" } },
            {
              name: "shippedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "canceledAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "idempotencyKey",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "noNotification",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            { name: "swap", args: [], type: { name: "Swap", kind: "OBJECT" } },
            {
              name: "fulfillmentProvider",
              args: [],
              type: { name: "FulfillmentProvider", kind: "OBJECT" },
            },
            {
              name: "claimOrder",
              args: [],
              type: { name: "ClaimOrder", kind: "OBJECT" },
            },
            {
              name: "order",
              args: [],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "fulfillmentItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "FulfillmentItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "fulfillmentItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "trackingLinks",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "TrackingLinkWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "trackingLinksCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "FulfillmentWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "FulfillmentWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "TrackingLinkManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "FulfillmentOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "FulfillmentUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "FulfillmentProviderRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "TrackingLinkRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "FulfillmentUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "FulfillmentCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "FulfillmentProviderRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "TrackingLinkRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentItem",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "quantity",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "fulfillment",
              args: [],
              type: { name: "Fulfillment", kind: "OBJECT" },
            },
            {
              name: "lineItem",
              args: [],
              type: { name: "LineItem", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "FulfillmentItemWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentItemWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentItemOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentItemUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentItemUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentItemCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentProvider",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "code",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "isInstalled",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "fulfillments",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "FulfillmentWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "fulfillmentsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "regions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "RegionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "regionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "shippingOptions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingOptionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingOptionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "FulfillmentProviderWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentProviderWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentProviderOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentProviderUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentProviderUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentProviderCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "GiftCard",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "code",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            { name: "value", args: [], type: { name: "Int", kind: "SCALAR" } },
            {
              name: "balance",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "isDisabled",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "endsAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "order",
              args: [],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "carts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "CartWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "cartsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "giftCardTransactions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "GiftCardTransactionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "giftCardTransactionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "region",
              args: [],
              type: { name: "Region", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "GiftCardWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "GiftCardWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "GiftCardOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "GiftCardUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "GiftCardUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "GiftCardCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "GiftCardTransaction",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            { name: "amount", args: [], type: { name: "Int", kind: "SCALAR" } },
            {
              name: "isTaxable",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "taxRate",
              args: [],
              type: { name: "Float", kind: "SCALAR" },
            },
            {
              name: "giftCard",
              args: [],
              type: { name: "GiftCard", kind: "OBJECT" },
            },
            {
              name: "order",
              args: [],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "GiftCardTransactionWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "GiftCardTransactionWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "GiftCardTransactionOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "GiftCardTransactionUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "GiftCardRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "GiftCardTransactionUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "GiftCardTransactionCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "GiftCardRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "IdempotencyKey",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "idempotencyKey",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "requestMethod",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "requestParams",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "requestPath",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "responseCode",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "responseBody",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "recoveryPoint",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "lockedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "IdempotencyKeyWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "IdempotencyKeyWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "IdempotencyKeyOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "IdempotencyKeyUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "IdempotencyKeyUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "IdempotencyKeyCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "Invite",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "userEmail",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "role",
              args: [],
              type: { name: "InviteRoleType", kind: "ENUM" },
            },
            {
              name: "accepted",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "token",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "expiresAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "InviteRoleType", kind: "ENUM", fields: null },
        { name: "InviteWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "InviteWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "InviteRoleTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "InviteOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "InviteUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "InviteUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "InviteCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "LineItemAdjustment",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            { name: "amount", args: [], type: { name: "Int", kind: "SCALAR" } },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "discount",
              args: [],
              type: { name: "Discount", kind: "OBJECT" },
            },
            {
              name: "lineItem",
              args: [],
              type: { name: "LineItem", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "LineItemAdjustmentWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemAdjustmentWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemAdjustmentOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemAdjustmentUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemAdjustmentUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemAdjustmentCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "DiscountRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemTaxLine",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            { name: "rate", args: [], type: { name: "Float", kind: "SCALAR" } },
            {
              name: "name",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "code",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "lineItem",
              args: [],
              type: { name: "LineItem", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "LineItemTaxLineWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemTaxLineWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "FloatFilter", kind: "INPUT_OBJECT", fields: null },
        {
          name: "LineItemTaxLineOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemTaxLineUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemTaxLineUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "LineItemTaxLineCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "MoneyAmount",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            { name: "amount", args: [], type: { name: "Int", kind: "SCALAR" } },
            {
              name: "minQuantity",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "maxQuantity",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productVariant",
              args: [],
              type: { name: "ProductVariant", kind: "OBJECT" },
            },
            {
              name: "region",
              args: [],
              type: { name: "Region", kind: "OBJECT" },
            },
            {
              name: "currency",
              args: [],
              type: { name: "Currency", kind: "OBJECT" },
            },
            {
              name: "priceList",
              args: [],
              type: { name: "PriceList", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "MoneyAmountWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "MoneyAmountWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "MoneyAmountOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "MoneyAmountUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "PriceListRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "MoneyAmountUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "MoneyAmountCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "PriceListRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "Note",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "value",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "resourceType",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "resourceId",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "authorId",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "NoteWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "NoteWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "NoteOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "NoteUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "NoteUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "NoteCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "Notification",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "eventName",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "resourceType",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "resourceId",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            { name: "to", args: [], type: { name: "String", kind: "SCALAR" } },
            { name: "data", args: [], type: { name: "JSON", kind: "SCALAR" } },
            {
              name: "parentId",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "notificationProvider",
              args: [],
              type: { name: "NotificationProvider", kind: "OBJECT" },
            },
            {
              name: "customer",
              args: [],
              type: { name: "Customer", kind: "OBJECT" },
            },
            {
              name: "otherNotifications",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "NotificationWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "otherNotificationsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "NotificationWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "NotificationWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "NotificationOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "NotificationUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "NotificationProviderRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "NotificationUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "NotificationCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "NotificationProviderRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "NotificationProvider",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "isInstalled",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "notifications",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "NotificationWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "notificationsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "NotificationProviderWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "NotificationProviderWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "NotificationProviderOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "NotificationProviderUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "NotificationProviderUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "NotificationProviderCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "OAuth",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "displayName",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "applicationName",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "installUrl",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "uninstallUrl",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            { name: "data", args: [], type: { name: "JSON", kind: "SCALAR" } },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "OAuthWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "OAuthWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "OAuthOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "OAuthUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "OAuthUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "OAuthCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "PaymentProvider",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "code",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "isInstalled",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "regions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "RegionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "regionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "paymentSessions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "PaymentSessionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "paymentSessionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "PaymentProviderWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentProviderWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentProviderOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentProviderUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentProviderUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentProviderCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentSession",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "isSelected",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "status",
              args: [],
              type: { name: "PaymentSessionStatusType", kind: "ENUM" },
            },
            { name: "data", args: [], type: { name: "JSON", kind: "SCALAR" } },
            {
              name: "idempotencyKey",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            { name: "cart", args: [], type: { name: "Cart", kind: "OBJECT" } },
            {
              name: "paymentProvider",
              args: [],
              type: { name: "PaymentProvider", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "PaymentSessionStatusType", kind: "ENUM", fields: null },
        {
          name: "PaymentSessionWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentSessionWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentSessionStatusTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentSessionOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentSessionUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentProviderRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentSessionUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentSessionCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentProviderRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PriceList",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "name",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "type",
              args: [],
              type: { name: "PriceListTypeType", kind: "ENUM" },
            },
            {
              name: "status",
              args: [],
              type: { name: "PriceListStatusType", kind: "ENUM" },
            },
            {
              name: "startsAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "endsAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "moneyAmounts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "MoneyAmountWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "moneyAmountsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "customerGroups",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "CustomerGroupWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "customerGroupsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "PriceListTypeType", kind: "ENUM", fields: null },
        { name: "PriceListStatusType", kind: "ENUM", fields: null },
        {
          name: "PriceListWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "PriceListWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "PriceListTypeTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PriceListStatusTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "PriceListOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "PriceListUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "PriceListUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "PriceListCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "Refund",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            { name: "amount", args: [], type: { name: "Int", kind: "SCALAR" } },
            {
              name: "note",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "reason",
              args: [],
              type: { name: "RefundReasonType", kind: "ENUM" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "idempotencyKey",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "order",
              args: [],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "RefundReasonType", kind: "ENUM", fields: null },
        { name: "RefundWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "RefundWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "RefundReasonTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "RefundOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "RefundUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "RefundUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "RefundCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "Region",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "code",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "name",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "taxRate",
              args: [],
              type: { name: "Float", kind: "SCALAR" },
            },
            {
              name: "taxCode",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "giftCardsTaxable",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "automaticTaxes",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "currency",
              args: [],
              type: { name: "Currency", kind: "OBJECT" },
            },
            {
              name: "carts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "CartWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "cartsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "countries",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "CountryWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "countriesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "discounts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discountsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "giftCards",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "GiftCardWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "giftCardsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "moneyAmounts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "MoneyAmountWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "moneyAmountsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "orders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "OrderWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "ordersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "taxProvider",
              args: [],
              type: { name: "TaxProvider", kind: "OBJECT" },
            },
            {
              name: "fulfillmentProviders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "FulfillmentProviderWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "fulfillmentProvidersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "paymentProviders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "PaymentProviderWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "paymentProvidersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "shippingOptions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingOptionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingOptionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "taxRates",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "TaxRateWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "taxRatesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "RegionWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "RegionWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "CountryManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentProviderManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentProviderManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "RegionOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "RegionUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "CountryRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "TaxProviderRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentProviderRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentProviderRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "RegionUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "RegionCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "CountryRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "TaxProviderRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "FulfillmentProviderRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "PaymentProviderRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "Return",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "status",
              args: [],
              type: { name: "ReturnStatusType", kind: "ENUM" },
            },
            {
              name: "shippingData",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "refundAmount",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "receivedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "idempotencyKey",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "noNotification",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "claimOrder",
              args: [],
              type: { name: "ClaimOrder", kind: "OBJECT" },
            },
            { name: "swap", args: [], type: { name: "Swap", kind: "OBJECT" } },
            {
              name: "order",
              args: [],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "returnItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ReturnItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "returnItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "shippingMethod",
              args: [],
              type: { name: "ShippingMethod", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "ReturnStatusType", kind: "ENUM", fields: null },
        { name: "ReturnWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ReturnWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ReturnStatusTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ReturnOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ReturnUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ShippingMethodRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ReturnUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "ReturnCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ShippingMethodRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ReturnItem",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "quantity",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "isRequested",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "requestedQuantity",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "receivedQuantity",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "note",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "return",
              args: [],
              type: { name: "Return", kind: "OBJECT" },
            },
            {
              name: "lineItem",
              args: [],
              type: { name: "LineItem", kind: "OBJECT" },
            },
            {
              name: "returnReason",
              args: [],
              type: { name: "ReturnReason", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ReturnItemWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ReturnItemWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ReturnItemOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ReturnItemUpdateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ReturnReasonRelateToOneForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ReturnItemUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "ReturnItemCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ReturnReasonRelateToOneForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ReturnReason",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "value",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "label",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "parentReturnReason",
              args: [],
              type: { name: "ReturnReason", kind: "OBJECT" },
            },
            {
              name: "returnItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ReturnItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "returnItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ReturnReasonWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ReturnReasonWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ReturnReasonOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "ReturnReasonUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "ReturnReasonUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "ReturnReasonCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "ShippingMethod",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            { name: "price", args: [], type: { name: "Int", kind: "SCALAR" } },
            { name: "data", args: [], type: { name: "JSON", kind: "SCALAR" } },
            {
              name: "return",
              args: [],
              type: { name: "Return", kind: "OBJECT" },
            },
            {
              name: "order",
              args: [],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "claimOrder",
              args: [],
              type: { name: "ClaimOrder", kind: "OBJECT" },
            },
            { name: "cart", args: [], type: { name: "Cart", kind: "OBJECT" } },
            { name: "swap", args: [], type: { name: "Swap", kind: "OBJECT" } },
            {
              name: "shippingOption",
              args: [],
              type: { name: "ShippingOption", kind: "OBJECT" },
            },
            {
              name: "shippingMethodTaxLines",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingMethodTaxLineWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingMethodTaxLinesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ShippingMethodWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodTaxLineManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodTaxLineRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodTaxLineRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodTaxLine",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            { name: "rate", args: [], type: { name: "Float", kind: "SCALAR" } },
            {
              name: "name",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "code",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "shippingMethod",
              args: [],
              type: { name: "ShippingMethod", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ShippingMethodTaxLineWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodTaxLineWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodTaxLineOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodTaxLineUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodTaxLineUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingMethodTaxLineCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOption",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "name",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "priceType",
              args: [],
              type: { name: "ShippingOptionPriceTypeType", kind: "ENUM" },
            },
            { name: "amount", args: [], type: { name: "Int", kind: "SCALAR" } },
            {
              name: "isReturn",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            { name: "data", args: [], type: { name: "JSON", kind: "SCALAR" } },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "adminOnly",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "region",
              args: [],
              type: { name: "Region", kind: "OBJECT" },
            },
            {
              name: "fulfillmentProvider",
              args: [],
              type: { name: "FulfillmentProvider", kind: "OBJECT" },
            },
            {
              name: "shippingProfile",
              args: [],
              type: { name: "ShippingProfile", kind: "OBJECT" },
            },
            {
              name: "customShippingOptions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "CustomShippingOptionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "customShippingOptionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "shippingMethods",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingMethodWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingMethodsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "shippingOptionRequirements",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingOptionRequirementWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingOptionRequirementsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "taxRates",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "TaxRateWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "taxRatesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "ShippingOptionPriceTypeType", kind: "ENUM", fields: null },
        {
          name: "ShippingOptionWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionPriceTypeTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionRequirementManyRelationFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionRequirementRelateToManyForUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionRequirementRelateToManyForCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionRequirement",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "type",
              args: [],
              type: { name: "ShippingOptionRequirementTypeType", kind: "ENUM" },
            },
            { name: "amount", args: [], type: { name: "Int", kind: "SCALAR" } },
            {
              name: "shippingOption",
              args: [],
              type: { name: "ShippingOption", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "ShippingOptionRequirementTypeType",
          kind: "ENUM",
          fields: null,
        },
        {
          name: "ShippingOptionRequirementWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionRequirementWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionRequirementTypeTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionRequirementOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionRequirementUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionRequirementUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingOptionRequirementCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingProfile",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "name",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "type",
              args: [],
              type: { name: "ShippingProfileTypeType", kind: "ENUM" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "products",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "shippingOptions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingOptionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingOptionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "ShippingProfileTypeType", kind: "ENUM", fields: null },
        {
          name: "ShippingProfileWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingProfileWhereInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingProfileTypeTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingProfileOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingProfileUpdateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingProfileUpdateArgs",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "ShippingProfileCreateInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "Store",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "name",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "defaultCurrencyCode",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "swapLinkTemplate",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "paymentLinkTemplate",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "inviteLinkTemplate",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "currency",
              args: [],
              type: { name: "Currency", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "StoreWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "StoreWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "StoreOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "StoreUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "StoreUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "StoreCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "Swap",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "fulfillmentStatus",
              args: [],
              type: { name: "SwapFulfillmentStatusType", kind: "ENUM" },
            },
            {
              name: "paymentStatus",
              args: [],
              type: { name: "SwapPaymentStatusType", kind: "ENUM" },
            },
            {
              name: "differenceDue",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "confirmedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "idempotencyKey",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "noNotification",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "canceledAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "allowBackorder",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            { name: "cart", args: [], type: { name: "Cart", kind: "OBJECT" } },
            {
              name: "order",
              args: [],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "address",
              args: [],
              type: { name: "Address", kind: "OBJECT" },
            },
            {
              name: "lineItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "LineItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "lineItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "fulfillments",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "FulfillmentWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "fulfillmentsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "payment",
              args: [],
              type: { name: "Payment", kind: "OBJECT" },
            },
            {
              name: "return",
              args: [],
              type: { name: "Return", kind: "OBJECT" },
            },
            {
              name: "shippingMethods",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingMethodWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingMethodsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "SwapFulfillmentStatusType", kind: "ENUM", fields: null },
        { name: "SwapPaymentStatusType", kind: "ENUM", fields: null },
        { name: "SwapWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "SwapWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "SwapFulfillmentStatusTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        {
          name: "SwapPaymentStatusTypeNullableFilter",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "SwapOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "SwapUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "SwapUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "SwapCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "TaxProvider",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "isInstalled",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
            {
              name: "regions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "RegionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "regionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "TaxProviderWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "TaxProviderWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "TaxProviderOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "TaxProviderUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "TaxProviderUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "TaxProviderCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "TaxRate",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            { name: "rate", args: [], type: { name: "Float", kind: "SCALAR" } },
            {
              name: "code",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "name",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "products",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productTypes",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductTypeWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productTypesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "region",
              args: [],
              type: { name: "Region", kind: "OBJECT" },
            },
            {
              name: "shippingOptions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingOptionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingOptionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        { name: "TaxRateWhereUniqueInput", kind: "INPUT_OBJECT", fields: null },
        { name: "TaxRateWhereInput", kind: "INPUT_OBJECT", fields: null },
        { name: "TaxRateOrderByInput", kind: "INPUT_OBJECT", fields: null },
        { name: "TaxRateUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "TaxRateUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "TaxRateCreateInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "TrackingLink",
          kind: "OBJECT",
          fields: [
            { name: "id", args: [], type: { name: null, kind: "NON_NULL" } },
            { name: "url", args: [], type: { name: "String", kind: "SCALAR" } },
            {
              name: "trackingNumber",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "metadata",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "idempotencyKey",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "fulfillment",
              args: [],
              type: { name: "Fulfillment", kind: "OBJECT" },
            },
            {
              name: "createdAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
            {
              name: "updatedAt",
              args: [],
              type: { name: "DateTime", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "TrackingLinkWhereUniqueInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "TrackingLinkWhereInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "TrackingLinkOrderByInput",
          kind: "INPUT_OBJECT",
          fields: null,
        },
        { name: "TrackingLinkUpdateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "TrackingLinkUpdateArgs", kind: "INPUT_OBJECT", fields: null },
        { name: "TrackingLinkCreateInput", kind: "INPUT_OBJECT", fields: null },
        { name: "JSON", kind: "SCALAR", fields: null },
        {
          name: "Mutation",
          kind: "OBJECT",
          fields: [
            {
              name: "createUser",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "User", kind: "OBJECT" },
            },
            {
              name: "createUsers",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateUser",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "User", kind: "OBJECT" },
            },
            {
              name: "updateUsers",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteUser",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "User", kind: "OBJECT" },
            },
            {
              name: "deleteUsers",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createRole",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Role", kind: "OBJECT" },
            },
            {
              name: "createRoles",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateRole",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Role", kind: "OBJECT" },
            },
            {
              name: "updateRoles",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteRole",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Role", kind: "OBJECT" },
            },
            {
              name: "deleteRoles",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createOrder",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "createOrders",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateOrder",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "updateOrders",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteOrder",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "deleteOrders",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createLineItem",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "LineItem", kind: "OBJECT" },
            },
            {
              name: "createLineItems",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateLineItem",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "LineItem", kind: "OBJECT" },
            },
            {
              name: "updateLineItems",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteLineItem",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "LineItem", kind: "OBJECT" },
            },
            {
              name: "deleteLineItems",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createProduct",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Product", kind: "OBJECT" },
            },
            {
              name: "createProducts",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateProduct",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Product", kind: "OBJECT" },
            },
            {
              name: "updateProducts",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteProduct",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Product", kind: "OBJECT" },
            },
            {
              name: "deleteProducts",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createProductCollection",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductCollection", kind: "OBJECT" },
            },
            {
              name: "createProductCollections",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateProductCollection",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ProductCollection", kind: "OBJECT" },
            },
            {
              name: "updateProductCollections",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteProductCollection",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductCollection", kind: "OBJECT" },
            },
            {
              name: "deleteProductCollections",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createProductCategory",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductCategory", kind: "OBJECT" },
            },
            {
              name: "createProductCategories",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateProductCategory",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ProductCategory", kind: "OBJECT" },
            },
            {
              name: "updateProductCategories",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteProductCategory",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductCategory", kind: "OBJECT" },
            },
            {
              name: "deleteProductCategories",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createProductImage",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductImage", kind: "OBJECT" },
            },
            {
              name: "createProductImages",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateProductImage",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ProductImage", kind: "OBJECT" },
            },
            {
              name: "updateProductImages",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteProductImage",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductImage", kind: "OBJECT" },
            },
            {
              name: "deleteProductImages",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createProductOption",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductOption", kind: "OBJECT" },
            },
            {
              name: "createProductOptions",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateProductOption",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ProductOption", kind: "OBJECT" },
            },
            {
              name: "updateProductOptions",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteProductOption",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductOption", kind: "OBJECT" },
            },
            {
              name: "deleteProductOptions",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createProductOptionValue",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductOptionValue", kind: "OBJECT" },
            },
            {
              name: "createProductOptionValues",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateProductOptionValue",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ProductOptionValue", kind: "OBJECT" },
            },
            {
              name: "updateProductOptionValues",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteProductOptionValue",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductOptionValue", kind: "OBJECT" },
            },
            {
              name: "deleteProductOptionValues",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createProductTag",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductTag", kind: "OBJECT" },
            },
            {
              name: "createProductTags",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateProductTag",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ProductTag", kind: "OBJECT" },
            },
            {
              name: "updateProductTags",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteProductTag",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductTag", kind: "OBJECT" },
            },
            {
              name: "deleteProductTags",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createProductType",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductType", kind: "OBJECT" },
            },
            {
              name: "createProductTypes",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateProductType",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ProductType", kind: "OBJECT" },
            },
            {
              name: "updateProductTypes",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteProductType",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductType", kind: "OBJECT" },
            },
            {
              name: "deleteProductTypes",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createProductVariant",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductVariant", kind: "OBJECT" },
            },
            {
              name: "createProductVariants",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateProductVariant",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ProductVariant", kind: "OBJECT" },
            },
            {
              name: "updateProductVariants",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteProductVariant",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductVariant", kind: "OBJECT" },
            },
            {
              name: "deleteProductVariants",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createPayment",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Payment", kind: "OBJECT" },
            },
            {
              name: "createPayments",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updatePayment",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Payment", kind: "OBJECT" },
            },
            {
              name: "updatePayments",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deletePayment",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Payment", kind: "OBJECT" },
            },
            {
              name: "deletePayments",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createAddress",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Address", kind: "OBJECT" },
            },
            {
              name: "createAddresses",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateAddress",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Address", kind: "OBJECT" },
            },
            {
              name: "updateAddresses",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteAddress",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Address", kind: "OBJECT" },
            },
            {
              name: "deleteAddresses",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createCart",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Cart", kind: "OBJECT" },
            },
            {
              name: "createCarts",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateCart",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Cart", kind: "OBJECT" },
            },
            {
              name: "updateCarts",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteCart",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Cart", kind: "OBJECT" },
            },
            {
              name: "deleteCarts",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createApiKey",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ApiKey", kind: "OBJECT" },
            },
            {
              name: "createApiKeys",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateApiKey",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ApiKey", kind: "OBJECT" },
            },
            {
              name: "updateApiKeys",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteApiKey",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ApiKey", kind: "OBJECT" },
            },
            {
              name: "deleteApiKeys",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createClaimOrder",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ClaimOrder", kind: "OBJECT" },
            },
            {
              name: "createClaimOrders",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateClaimOrder",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ClaimOrder", kind: "OBJECT" },
            },
            {
              name: "updateClaimOrders",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteClaimOrder",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ClaimOrder", kind: "OBJECT" },
            },
            {
              name: "deleteClaimOrders",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createClaimItem",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ClaimItem", kind: "OBJECT" },
            },
            {
              name: "createClaimItems",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateClaimItem",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ClaimItem", kind: "OBJECT" },
            },
            {
              name: "updateClaimItems",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteClaimItem",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ClaimItem", kind: "OBJECT" },
            },
            {
              name: "deleteClaimItems",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createClaimImage",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ClaimImage", kind: "OBJECT" },
            },
            {
              name: "createClaimImages",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateClaimImage",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ClaimImage", kind: "OBJECT" },
            },
            {
              name: "updateClaimImages",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteClaimImage",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ClaimImage", kind: "OBJECT" },
            },
            {
              name: "deleteClaimImages",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createClaimTag",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ClaimTag", kind: "OBJECT" },
            },
            {
              name: "createClaimTags",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateClaimTag",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ClaimTag", kind: "OBJECT" },
            },
            {
              name: "updateClaimTags",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteClaimTag",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ClaimTag", kind: "OBJECT" },
            },
            {
              name: "deleteClaimTags",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createCountry",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Country", kind: "OBJECT" },
            },
            {
              name: "createCountries",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateCountry",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Country", kind: "OBJECT" },
            },
            {
              name: "updateCountries",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteCountry",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Country", kind: "OBJECT" },
            },
            {
              name: "deleteCountries",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createCurrency",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Currency", kind: "OBJECT" },
            },
            {
              name: "createCurrencies",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateCurrency",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Currency", kind: "OBJECT" },
            },
            {
              name: "updateCurrencies",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteCurrency",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Currency", kind: "OBJECT" },
            },
            {
              name: "deleteCurrencies",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createCustomer",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Customer", kind: "OBJECT" },
            },
            {
              name: "createCustomers",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateCustomer",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Customer", kind: "OBJECT" },
            },
            {
              name: "updateCustomers",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteCustomer",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Customer", kind: "OBJECT" },
            },
            {
              name: "deleteCustomers",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createCustomerGroup",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "CustomerGroup", kind: "OBJECT" },
            },
            {
              name: "createCustomerGroups",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateCustomerGroup",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "CustomerGroup", kind: "OBJECT" },
            },
            {
              name: "updateCustomerGroups",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteCustomerGroup",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "CustomerGroup", kind: "OBJECT" },
            },
            {
              name: "deleteCustomerGroups",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createCustomShippingOption",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "CustomShippingOption", kind: "OBJECT" },
            },
            {
              name: "createCustomShippingOptions",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateCustomShippingOption",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "CustomShippingOption", kind: "OBJECT" },
            },
            {
              name: "updateCustomShippingOptions",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteCustomShippingOption",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "CustomShippingOption", kind: "OBJECT" },
            },
            {
              name: "deleteCustomShippingOptions",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createDiscount",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Discount", kind: "OBJECT" },
            },
            {
              name: "createDiscounts",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateDiscount",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Discount", kind: "OBJECT" },
            },
            {
              name: "updateDiscounts",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteDiscount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Discount", kind: "OBJECT" },
            },
            {
              name: "deleteDiscounts",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createDiscountCondition",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "DiscountCondition", kind: "OBJECT" },
            },
            {
              name: "createDiscountConditions",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateDiscountCondition",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "DiscountCondition", kind: "OBJECT" },
            },
            {
              name: "updateDiscountConditions",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteDiscountCondition",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "DiscountCondition", kind: "OBJECT" },
            },
            {
              name: "deleteDiscountConditions",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createDiscountRule",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "DiscountRule", kind: "OBJECT" },
            },
            {
              name: "createDiscountRules",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateDiscountRule",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "DiscountRule", kind: "OBJECT" },
            },
            {
              name: "updateDiscountRules",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteDiscountRule",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "DiscountRule", kind: "OBJECT" },
            },
            {
              name: "deleteDiscountRules",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createDraftOrder",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "DraftOrder", kind: "OBJECT" },
            },
            {
              name: "createDraftOrders",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateDraftOrder",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "DraftOrder", kind: "OBJECT" },
            },
            {
              name: "updateDraftOrders",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteDraftOrder",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "DraftOrder", kind: "OBJECT" },
            },
            {
              name: "deleteDraftOrders",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createFulfillment",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Fulfillment", kind: "OBJECT" },
            },
            {
              name: "createFulfillments",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateFulfillment",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Fulfillment", kind: "OBJECT" },
            },
            {
              name: "updateFulfillments",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteFulfillment",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Fulfillment", kind: "OBJECT" },
            },
            {
              name: "deleteFulfillments",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createFulfillmentItem",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "FulfillmentItem", kind: "OBJECT" },
            },
            {
              name: "createFulfillmentItems",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateFulfillmentItem",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "FulfillmentItem", kind: "OBJECT" },
            },
            {
              name: "updateFulfillmentItems",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteFulfillmentItem",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "FulfillmentItem", kind: "OBJECT" },
            },
            {
              name: "deleteFulfillmentItems",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createFulfillmentProvider",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "FulfillmentProvider", kind: "OBJECT" },
            },
            {
              name: "createFulfillmentProviders",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateFulfillmentProvider",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "FulfillmentProvider", kind: "OBJECT" },
            },
            {
              name: "updateFulfillmentProviders",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteFulfillmentProvider",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "FulfillmentProvider", kind: "OBJECT" },
            },
            {
              name: "deleteFulfillmentProviders",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createGiftCard",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "GiftCard", kind: "OBJECT" },
            },
            {
              name: "createGiftCards",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateGiftCard",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "GiftCard", kind: "OBJECT" },
            },
            {
              name: "updateGiftCards",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteGiftCard",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "GiftCard", kind: "OBJECT" },
            },
            {
              name: "deleteGiftCards",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createGiftCardTransaction",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "GiftCardTransaction", kind: "OBJECT" },
            },
            {
              name: "createGiftCardTransactions",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateGiftCardTransaction",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "GiftCardTransaction", kind: "OBJECT" },
            },
            {
              name: "updateGiftCardTransactions",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteGiftCardTransaction",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "GiftCardTransaction", kind: "OBJECT" },
            },
            {
              name: "deleteGiftCardTransactions",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createIdempotencyKey",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "IdempotencyKey", kind: "OBJECT" },
            },
            {
              name: "createIdempotencyKeys",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateIdempotencyKey",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "IdempotencyKey", kind: "OBJECT" },
            },
            {
              name: "updateIdempotencyKeys",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteIdempotencyKey",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "IdempotencyKey", kind: "OBJECT" },
            },
            {
              name: "deleteIdempotencyKeys",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createInvite",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Invite", kind: "OBJECT" },
            },
            {
              name: "createInvites",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateInvite",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Invite", kind: "OBJECT" },
            },
            {
              name: "updateInvites",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteInvite",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Invite", kind: "OBJECT" },
            },
            {
              name: "deleteInvites",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createLineItemAdjustment",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "LineItemAdjustment", kind: "OBJECT" },
            },
            {
              name: "createLineItemAdjustments",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateLineItemAdjustment",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "LineItemAdjustment", kind: "OBJECT" },
            },
            {
              name: "updateLineItemAdjustments",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteLineItemAdjustment",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "LineItemAdjustment", kind: "OBJECT" },
            },
            {
              name: "deleteLineItemAdjustments",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createLineItemTaxLine",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "LineItemTaxLine", kind: "OBJECT" },
            },
            {
              name: "createLineItemTaxLines",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateLineItemTaxLine",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "LineItemTaxLine", kind: "OBJECT" },
            },
            {
              name: "updateLineItemTaxLines",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteLineItemTaxLine",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "LineItemTaxLine", kind: "OBJECT" },
            },
            {
              name: "deleteLineItemTaxLines",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createMoneyAmount",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "MoneyAmount", kind: "OBJECT" },
            },
            {
              name: "createMoneyAmounts",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateMoneyAmount",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "MoneyAmount", kind: "OBJECT" },
            },
            {
              name: "updateMoneyAmounts",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteMoneyAmount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "MoneyAmount", kind: "OBJECT" },
            },
            {
              name: "deleteMoneyAmounts",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createNote",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Note", kind: "OBJECT" },
            },
            {
              name: "createNotes",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateNote",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Note", kind: "OBJECT" },
            },
            {
              name: "updateNotes",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteNote",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Note", kind: "OBJECT" },
            },
            {
              name: "deleteNotes",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createNotification",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Notification", kind: "OBJECT" },
            },
            {
              name: "createNotifications",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateNotification",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Notification", kind: "OBJECT" },
            },
            {
              name: "updateNotifications",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteNotification",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Notification", kind: "OBJECT" },
            },
            {
              name: "deleteNotifications",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createNotificationProvider",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "NotificationProvider", kind: "OBJECT" },
            },
            {
              name: "createNotificationProviders",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateNotificationProvider",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "NotificationProvider", kind: "OBJECT" },
            },
            {
              name: "updateNotificationProviders",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteNotificationProvider",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "NotificationProvider", kind: "OBJECT" },
            },
            {
              name: "deleteNotificationProviders",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createOAuth",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "OAuth", kind: "OBJECT" },
            },
            {
              name: "createOAuths",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateOAuth",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "OAuth", kind: "OBJECT" },
            },
            {
              name: "updateOAuths",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteOAuth",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "OAuth", kind: "OBJECT" },
            },
            {
              name: "deleteOAuths",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createPaymentProvider",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "PaymentProvider", kind: "OBJECT" },
            },
            {
              name: "createPaymentProviders",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updatePaymentProvider",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "PaymentProvider", kind: "OBJECT" },
            },
            {
              name: "updatePaymentProviders",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deletePaymentProvider",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "PaymentProvider", kind: "OBJECT" },
            },
            {
              name: "deletePaymentProviders",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createPaymentSession",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "PaymentSession", kind: "OBJECT" },
            },
            {
              name: "createPaymentSessions",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updatePaymentSession",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "PaymentSession", kind: "OBJECT" },
            },
            {
              name: "updatePaymentSessions",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deletePaymentSession",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "PaymentSession", kind: "OBJECT" },
            },
            {
              name: "deletePaymentSessions",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createPriceList",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "PriceList", kind: "OBJECT" },
            },
            {
              name: "createPriceLists",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updatePriceList",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "PriceList", kind: "OBJECT" },
            },
            {
              name: "updatePriceLists",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deletePriceList",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "PriceList", kind: "OBJECT" },
            },
            {
              name: "deletePriceLists",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createRefund",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Refund", kind: "OBJECT" },
            },
            {
              name: "createRefunds",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateRefund",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Refund", kind: "OBJECT" },
            },
            {
              name: "updateRefunds",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteRefund",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Refund", kind: "OBJECT" },
            },
            {
              name: "deleteRefunds",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createRegion",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Region", kind: "OBJECT" },
            },
            {
              name: "createRegions",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateRegion",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Region", kind: "OBJECT" },
            },
            {
              name: "updateRegions",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteRegion",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Region", kind: "OBJECT" },
            },
            {
              name: "deleteRegions",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createReturn",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Return", kind: "OBJECT" },
            },
            {
              name: "createReturns",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateReturn",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Return", kind: "OBJECT" },
            },
            {
              name: "updateReturns",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteReturn",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Return", kind: "OBJECT" },
            },
            {
              name: "deleteReturns",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createReturnItem",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ReturnItem", kind: "OBJECT" },
            },
            {
              name: "createReturnItems",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateReturnItem",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ReturnItem", kind: "OBJECT" },
            },
            {
              name: "updateReturnItems",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteReturnItem",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ReturnItem", kind: "OBJECT" },
            },
            {
              name: "deleteReturnItems",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createReturnReason",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ReturnReason", kind: "OBJECT" },
            },
            {
              name: "createReturnReasons",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateReturnReason",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ReturnReason", kind: "OBJECT" },
            },
            {
              name: "updateReturnReasons",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteReturnReason",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ReturnReason", kind: "OBJECT" },
            },
            {
              name: "deleteReturnReasons",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createShippingMethod",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingMethod", kind: "OBJECT" },
            },
            {
              name: "createShippingMethods",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateShippingMethod",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ShippingMethod", kind: "OBJECT" },
            },
            {
              name: "updateShippingMethods",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteShippingMethod",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingMethod", kind: "OBJECT" },
            },
            {
              name: "deleteShippingMethods",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createShippingMethodTaxLine",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingMethodTaxLine", kind: "OBJECT" },
            },
            {
              name: "createShippingMethodTaxLines",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateShippingMethodTaxLine",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ShippingMethodTaxLine", kind: "OBJECT" },
            },
            {
              name: "updateShippingMethodTaxLines",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteShippingMethodTaxLine",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingMethodTaxLine", kind: "OBJECT" },
            },
            {
              name: "deleteShippingMethodTaxLines",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createShippingOption",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingOption", kind: "OBJECT" },
            },
            {
              name: "createShippingOptions",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateShippingOption",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ShippingOption", kind: "OBJECT" },
            },
            {
              name: "updateShippingOptions",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteShippingOption",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingOption", kind: "OBJECT" },
            },
            {
              name: "deleteShippingOptions",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createShippingOptionRequirement",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingOptionRequirement", kind: "OBJECT" },
            },
            {
              name: "createShippingOptionRequirements",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateShippingOptionRequirement",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ShippingOptionRequirement", kind: "OBJECT" },
            },
            {
              name: "updateShippingOptionRequirements",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteShippingOptionRequirement",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingOptionRequirement", kind: "OBJECT" },
            },
            {
              name: "deleteShippingOptionRequirements",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createShippingProfile",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingProfile", kind: "OBJECT" },
            },
            {
              name: "createShippingProfiles",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateShippingProfile",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "ShippingProfile", kind: "OBJECT" },
            },
            {
              name: "updateShippingProfiles",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteShippingProfile",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingProfile", kind: "OBJECT" },
            },
            {
              name: "deleteShippingProfiles",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createStore",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Store", kind: "OBJECT" },
            },
            {
              name: "createStores",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateStore",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Store", kind: "OBJECT" },
            },
            {
              name: "updateStores",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteStore",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Store", kind: "OBJECT" },
            },
            {
              name: "deleteStores",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createSwap",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Swap", kind: "OBJECT" },
            },
            {
              name: "createSwaps",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateSwap",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "Swap", kind: "OBJECT" },
            },
            {
              name: "updateSwaps",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteSwap",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Swap", kind: "OBJECT" },
            },
            {
              name: "deleteSwaps",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createTaxProvider",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "TaxProvider", kind: "OBJECT" },
            },
            {
              name: "createTaxProviders",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateTaxProvider",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "TaxProvider", kind: "OBJECT" },
            },
            {
              name: "updateTaxProviders",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteTaxProvider",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "TaxProvider", kind: "OBJECT" },
            },
            {
              name: "deleteTaxProviders",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createTaxRate",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "TaxRate", kind: "OBJECT" },
            },
            {
              name: "createTaxRates",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateTaxRate",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "TaxRate", kind: "OBJECT" },
            },
            {
              name: "updateTaxRates",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteTaxRate",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "TaxRate", kind: "OBJECT" },
            },
            {
              name: "deleteTaxRates",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "createTrackingLink",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "TrackingLink", kind: "OBJECT" },
            },
            {
              name: "createTrackingLinks",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "updateTrackingLink",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "data", type: { name: null, kind: "NON_NULL" } },
              ],
              type: { name: "TrackingLink", kind: "OBJECT" },
            },
            {
              name: "updateTrackingLinks",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "deleteTrackingLink",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "TrackingLink", kind: "OBJECT" },
            },
            {
              name: "deleteTrackingLinks",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "endSession",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "authenticateUserWithPassword",
              args: [
                { name: "email", type: { name: null, kind: "NON_NULL" } },
                { name: "password", type: { name: null, kind: "NON_NULL" } },
              ],
              type: {
                name: "UserAuthenticationWithPasswordResult",
                kind: "UNION",
              },
            },
            {
              name: "createInitialUser",
              args: [{ name: "data", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "sendUserPasswordResetLink",
              args: [{ name: "email", type: { name: null, kind: "NON_NULL" } }],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "redeemUserPasswordResetToken",
              args: [
                { name: "email", type: { name: null, kind: "NON_NULL" } },
                { name: "token", type: { name: null, kind: "NON_NULL" } },
                { name: "password", type: { name: null, kind: "NON_NULL" } },
              ],
              type: {
                name: "RedeemUserPasswordResetTokenResult",
                kind: "OBJECT",
              },
            },
          ],
        },
        {
          name: "UserAuthenticationWithPasswordResult",
          kind: "UNION",
          fields: null,
        },
        {
          name: "UserAuthenticationWithPasswordSuccess",
          kind: "OBJECT",
          fields: [
            {
              name: "sessionToken",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            { name: "item", args: [], type: { name: null, kind: "NON_NULL" } },
          ],
        },
        {
          name: "UserAuthenticationWithPasswordFailure",
          kind: "OBJECT",
          fields: [
            {
              name: "message",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
          ],
        },
        { name: "CreateInitialUserInput", kind: "INPUT_OBJECT", fields: null },
        {
          name: "RedeemUserPasswordResetTokenResult",
          kind: "OBJECT",
          fields: [
            { name: "code", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "message",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
          ],
        },
        {
          name: "PasswordResetRedemptionErrorCode",
          kind: "ENUM",
          fields: null,
        },
        {
          name: "Query",
          kind: "OBJECT",
          fields: [
            {
              name: "users",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "UserWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "user",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "User", kind: "OBJECT" },
            },
            {
              name: "usersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "roles",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "RoleWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "role",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Role", kind: "OBJECT" },
            },
            {
              name: "rolesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "orders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "OrderWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "order",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Order", kind: "OBJECT" },
            },
            {
              name: "ordersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "lineItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "LineItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "lineItem",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "LineItem", kind: "OBJECT" },
            },
            {
              name: "lineItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "products",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "product",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Product", kind: "OBJECT" },
            },
            {
              name: "productsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productCollections",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductCollectionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productCollection",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductCollection", kind: "OBJECT" },
            },
            {
              name: "productCollectionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productCategories",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductCategoryWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productCategory",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductCategory", kind: "OBJECT" },
            },
            {
              name: "productCategoriesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productImages",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductImageWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productImage",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductImage", kind: "OBJECT" },
            },
            {
              name: "productImagesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productOptions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductOptionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productOption",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductOption", kind: "OBJECT" },
            },
            {
              name: "productOptionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productOptionValues",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductOptionValueWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productOptionValue",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductOptionValue", kind: "OBJECT" },
            },
            {
              name: "productOptionValuesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productTags",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductTagWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productTag",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductTag", kind: "OBJECT" },
            },
            {
              name: "productTagsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productTypes",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductTypeWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productType",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductType", kind: "OBJECT" },
            },
            {
              name: "productTypesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "productVariants",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ProductVariantWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "productVariant",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ProductVariant", kind: "OBJECT" },
            },
            {
              name: "productVariantsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "payments",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "PaymentWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "payment",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Payment", kind: "OBJECT" },
            },
            {
              name: "paymentsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "addresses",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "AddressWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "address",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Address", kind: "OBJECT" },
            },
            {
              name: "addressesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "carts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "CartWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "cart",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Cart", kind: "OBJECT" },
            },
            {
              name: "cartsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "apiKeys",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ApiKeyWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "apiKey",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ApiKey", kind: "OBJECT" },
            },
            {
              name: "apiKeysCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "claimOrders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ClaimOrderWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "claimOrder",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ClaimOrder", kind: "OBJECT" },
            },
            {
              name: "claimOrdersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "claimItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ClaimItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "claimItem",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ClaimItem", kind: "OBJECT" },
            },
            {
              name: "claimItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "claimImages",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ClaimImageWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "claimImage",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ClaimImage", kind: "OBJECT" },
            },
            {
              name: "claimImagesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "claimTags",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ClaimTagWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "claimTag",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ClaimTag", kind: "OBJECT" },
            },
            {
              name: "claimTagsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "countries",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "CountryWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "country",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Country", kind: "OBJECT" },
            },
            {
              name: "countriesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "currencies",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "CurrencyWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "currency",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Currency", kind: "OBJECT" },
            },
            {
              name: "currenciesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "customers",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "CustomerWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "customer",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Customer", kind: "OBJECT" },
            },
            {
              name: "customersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "customerGroups",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "CustomerGroupWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "customerGroup",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "CustomerGroup", kind: "OBJECT" },
            },
            {
              name: "customerGroupsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "customShippingOptions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "CustomShippingOptionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "customShippingOption",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "CustomShippingOption", kind: "OBJECT" },
            },
            {
              name: "customShippingOptionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "discounts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Discount", kind: "OBJECT" },
            },
            {
              name: "discountsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "discountConditions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountConditionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discountCondition",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "DiscountCondition", kind: "OBJECT" },
            },
            {
              name: "discountConditionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "discountRules",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DiscountRuleWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "discountRule",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "DiscountRule", kind: "OBJECT" },
            },
            {
              name: "discountRulesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "draftOrders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "DraftOrderWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "draftOrder",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "DraftOrder", kind: "OBJECT" },
            },
            {
              name: "draftOrdersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "fulfillments",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "FulfillmentWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "fulfillment",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Fulfillment", kind: "OBJECT" },
            },
            {
              name: "fulfillmentsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "fulfillmentItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "FulfillmentItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "fulfillmentItem",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "FulfillmentItem", kind: "OBJECT" },
            },
            {
              name: "fulfillmentItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "fulfillmentProviders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "FulfillmentProviderWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "fulfillmentProvider",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "FulfillmentProvider", kind: "OBJECT" },
            },
            {
              name: "fulfillmentProvidersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "giftCards",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "GiftCardWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "giftCard",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "GiftCard", kind: "OBJECT" },
            },
            {
              name: "giftCardsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "giftCardTransactions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "GiftCardTransactionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "giftCardTransaction",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "GiftCardTransaction", kind: "OBJECT" },
            },
            {
              name: "giftCardTransactionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "idempotencyKeys",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "IdempotencyKeyWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "idempotencyKey",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "IdempotencyKey", kind: "OBJECT" },
            },
            {
              name: "idempotencyKeysCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "invites",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "InviteWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "invite",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Invite", kind: "OBJECT" },
            },
            {
              name: "invitesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "lineItemAdjustments",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "LineItemAdjustmentWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "lineItemAdjustment",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "LineItemAdjustment", kind: "OBJECT" },
            },
            {
              name: "lineItemAdjustmentsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "lineItemTaxLines",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "LineItemTaxLineWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "lineItemTaxLine",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "LineItemTaxLine", kind: "OBJECT" },
            },
            {
              name: "lineItemTaxLinesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "moneyAmounts",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "MoneyAmountWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "moneyAmount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "MoneyAmount", kind: "OBJECT" },
            },
            {
              name: "moneyAmountsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "notes",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "NoteWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "note",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Note", kind: "OBJECT" },
            },
            {
              name: "notesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "notifications",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "NotificationWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "notification",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Notification", kind: "OBJECT" },
            },
            {
              name: "notificationsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "notificationProviders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "NotificationProviderWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "notificationProvider",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "NotificationProvider", kind: "OBJECT" },
            },
            {
              name: "notificationProvidersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "oAuths",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "OAuthWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "oAuth",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "OAuth", kind: "OBJECT" },
            },
            {
              name: "oAuthsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "paymentProviders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "PaymentProviderWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "paymentProvider",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "PaymentProvider", kind: "OBJECT" },
            },
            {
              name: "paymentProvidersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "paymentSessions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "PaymentSessionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "paymentSession",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "PaymentSession", kind: "OBJECT" },
            },
            {
              name: "paymentSessionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "priceLists",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "PriceListWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "priceList",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "PriceList", kind: "OBJECT" },
            },
            {
              name: "priceListsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "refunds",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "RefundWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "refund",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Refund", kind: "OBJECT" },
            },
            {
              name: "refundsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "regions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "RegionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "region",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Region", kind: "OBJECT" },
            },
            {
              name: "regionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "returns",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ReturnWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "return",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Return", kind: "OBJECT" },
            },
            {
              name: "returnsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "returnItems",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ReturnItemWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "returnItem",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ReturnItem", kind: "OBJECT" },
            },
            {
              name: "returnItemsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "returnReasons",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ReturnReasonWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "returnReason",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ReturnReason", kind: "OBJECT" },
            },
            {
              name: "returnReasonsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "shippingMethods",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingMethodWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingMethod",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingMethod", kind: "OBJECT" },
            },
            {
              name: "shippingMethodsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "shippingMethodTaxLines",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingMethodTaxLineWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingMethodTaxLine",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingMethodTaxLine", kind: "OBJECT" },
            },
            {
              name: "shippingMethodTaxLinesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "shippingOptions",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingOptionWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingOption",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingOption", kind: "OBJECT" },
            },
            {
              name: "shippingOptionsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "shippingOptionRequirements",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingOptionRequirementWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingOptionRequirement",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingOptionRequirement", kind: "OBJECT" },
            },
            {
              name: "shippingOptionRequirementsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "shippingProfiles",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "ShippingProfileWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "shippingProfile",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "ShippingProfile", kind: "OBJECT" },
            },
            {
              name: "shippingProfilesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "stores",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "StoreWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "store",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Store", kind: "OBJECT" },
            },
            {
              name: "storesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "swaps",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: { name: "SwapWhereUniqueInput", kind: "INPUT_OBJECT" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "swap",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Swap", kind: "OBJECT" },
            },
            {
              name: "swapsCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "taxProviders",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "TaxProviderWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "taxProvider",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "TaxProvider", kind: "OBJECT" },
            },
            {
              name: "taxProvidersCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "taxRates",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "TaxRateWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "taxRate",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "TaxRate", kind: "OBJECT" },
            },
            {
              name: "taxRatesCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "trackingLinks",
              args: [
                { name: "where", type: { name: null, kind: "NON_NULL" } },
                { name: "orderBy", type: { name: null, kind: "NON_NULL" } },
                { name: "take", type: { name: "Int", kind: "SCALAR" } },
                { name: "skip", type: { name: null, kind: "NON_NULL" } },
                {
                  name: "cursor",
                  type: {
                    name: "TrackingLinkWhereUniqueInput",
                    kind: "INPUT_OBJECT",
                  },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "trackingLink",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "TrackingLink", kind: "OBJECT" },
            },
            {
              name: "trackingLinksCount",
              args: [{ name: "where", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "keystone",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "authenticatedItem",
              args: [],
              type: { name: "AuthenticatedItem", kind: "UNION" },
            },
            {
              name: "validateUserPasswordResetToken",
              args: [
                { name: "email", type: { name: null, kind: "NON_NULL" } },
                { name: "token", type: { name: null, kind: "NON_NULL" } },
              ],
              type: {
                name: "ValidateUserPasswordResetTokenResult",
                kind: "OBJECT",
              },
            },
            {
              name: "redirectToInit",
              args: [],
              type: { name: "Boolean", kind: "SCALAR" },
            },
          ],
        },
        { name: "AuthenticatedItem", kind: "UNION", fields: null },
        {
          name: "ValidateUserPasswordResetTokenResult",
          kind: "OBJECT",
          fields: [
            { name: "code", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "message",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
          ],
        },
        {
          name: "KeystoneMeta",
          kind: "OBJECT",
          fields: [
            {
              name: "adminMeta",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
          ],
        },
        {
          name: "KeystoneAdminMeta",
          kind: "OBJECT",
          fields: [
            { name: "lists", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "list",
              args: [{ name: "key", type: { name: null, kind: "NON_NULL" } }],
              type: { name: "KeystoneAdminUIListMeta", kind: "OBJECT" },
            },
          ],
        },
        {
          name: "KeystoneAdminUIListMeta",
          kind: "OBJECT",
          fields: [
            { name: "key", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "itemQueryName",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "listQueryName",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "hideCreate",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "hideDelete",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            { name: "path", args: [], type: { name: null, kind: "NON_NULL" } },
            { name: "label", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "singular",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "plural",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "initialColumns",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "pageSize",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "labelField",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "fields",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "groups",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "initialSort",
              args: [],
              type: { name: "KeystoneAdminUISort", kind: "OBJECT" },
            },
            {
              name: "isHidden",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "isSingleton",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
          ],
        },
        {
          name: "KeystoneAdminUIFieldMeta",
          kind: "OBJECT",
          fields: [
            { name: "path", args: [], type: { name: null, kind: "NON_NULL" } },
            { name: "label", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "isOrderable",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "isFilterable",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            { name: "isNonNull", args: [], type: { name: null, kind: "LIST" } },
            {
              name: "fieldMeta",
              args: [],
              type: { name: "JSON", kind: "SCALAR" },
            },
            {
              name: "viewsIndex",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "customViewsIndex",
              args: [],
              type: { name: "Int", kind: "SCALAR" },
            },
            {
              name: "createView",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "listView",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "itemView",
              args: [{ name: "id", type: { name: "ID", kind: "SCALAR" } }],
              type: {
                name: "KeystoneAdminUIFieldMetaItemView",
                kind: "OBJECT",
              },
            },
            {
              name: "search",
              args: [],
              type: { name: "QueryMode", kind: "ENUM" },
            },
          ],
        },
        {
          name: "KeystoneAdminUIFieldMetaIsNonNull",
          kind: "ENUM",
          fields: null,
        },
        {
          name: "KeystoneAdminUIFieldMetaCreateView",
          kind: "OBJECT",
          fields: [
            {
              name: "fieldMode",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
          ],
        },
        {
          name: "KeystoneAdminUIFieldMetaCreateViewFieldMode",
          kind: "ENUM",
          fields: null,
        },
        {
          name: "KeystoneAdminUIFieldMetaListView",
          kind: "OBJECT",
          fields: [
            {
              name: "fieldMode",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
          ],
        },
        {
          name: "KeystoneAdminUIFieldMetaListViewFieldMode",
          kind: "ENUM",
          fields: null,
        },
        {
          name: "KeystoneAdminUIFieldMetaItemView",
          kind: "OBJECT",
          fields: [
            {
              name: "fieldMode",
              args: [],
              type: {
                name: "KeystoneAdminUIFieldMetaItemViewFieldMode",
                kind: "ENUM",
              },
            },
            {
              name: "fieldPosition",
              args: [],
              type: {
                name: "KeystoneAdminUIFieldMetaItemViewFieldPosition",
                kind: "ENUM",
              },
            },
          ],
        },
        {
          name: "KeystoneAdminUIFieldMetaItemViewFieldMode",
          kind: "ENUM",
          fields: null,
        },
        {
          name: "KeystoneAdminUIFieldMetaItemViewFieldPosition",
          kind: "ENUM",
          fields: null,
        },
        {
          name: "KeystoneAdminUIFieldGroupMeta",
          kind: "OBJECT",
          fields: [
            { name: "label", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "fields",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
          ],
        },
        {
          name: "KeystoneAdminUISort",
          kind: "OBJECT",
          fields: [
            { name: "field", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "direction",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
          ],
        },
        { name: "KeystoneAdminUISortDirection", kind: "ENUM", fields: null },
        {
          name: "__Schema",
          kind: "OBJECT",
          fields: [
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            { name: "types", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "queryType",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "mutationType",
              args: [],
              type: { name: "__Type", kind: "OBJECT" },
            },
            {
              name: "subscriptionType",
              args: [],
              type: { name: "__Type", kind: "OBJECT" },
            },
            {
              name: "directives",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
          ],
        },
        {
          name: "__Type",
          kind: "OBJECT",
          fields: [
            { name: "kind", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "name",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "specifiedByURL",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "fields",
              args: [
                {
                  name: "includeDeprecated",
                  type: { name: "Boolean", kind: "SCALAR" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "interfaces",
              args: [],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "possibleTypes",
              args: [],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "enumValues",
              args: [
                {
                  name: "includeDeprecated",
                  type: { name: "Boolean", kind: "SCALAR" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "inputFields",
              args: [
                {
                  name: "includeDeprecated",
                  type: { name: "Boolean", kind: "SCALAR" },
                },
              ],
              type: { name: null, kind: "LIST" },
            },
            {
              name: "ofType",
              args: [],
              type: { name: "__Type", kind: "OBJECT" },
            },
          ],
        },
        { name: "__TypeKind", kind: "ENUM", fields: null },
        {
          name: "__Field",
          kind: "OBJECT",
          fields: [
            { name: "name", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "args",
              args: [
                {
                  name: "includeDeprecated",
                  type: { name: "Boolean", kind: "SCALAR" },
                },
              ],
              type: { name: null, kind: "NON_NULL" },
            },
            { name: "type", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "isDeprecated",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "deprecationReason",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "__InputValue",
          kind: "OBJECT",
          fields: [
            { name: "name", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            { name: "type", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "defaultValue",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "isDeprecated",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "deprecationReason",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "__EnumValue",
          kind: "OBJECT",
          fields: [
            { name: "name", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "isDeprecated",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "deprecationReason",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
          ],
        },
        {
          name: "__Directive",
          kind: "OBJECT",
          fields: [
            { name: "name", args: [], type: { name: null, kind: "NON_NULL" } },
            {
              name: "description",
              args: [],
              type: { name: "String", kind: "SCALAR" },
            },
            {
              name: "isRepeatable",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "locations",
              args: [],
              type: { name: null, kind: "NON_NULL" },
            },
            {
              name: "args",
              args: [
                {
                  name: "includeDeprecated",
                  type: { name: "Boolean", kind: "SCALAR" },
                },
              ],
              type: { name: null, kind: "NON_NULL" },
            },
          ],
        },
        { name: "__DirectiveLocation", kind: "ENUM", fields: null },
      ],
    },
  },
};

const removeRedundantValues = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(removeRedundantValues);
  }

  if (typeof obj === "object" && obj !== null) {
    const newObj = {};

    for (const key in obj) {
      const value = obj[key];

      if (key === "kind" && value === "NON_NULL") {
        continue; // Skip this key-value pair
      }

      if (key === "type") {
        newObj[key] = removeRedundantValues(value);
      } else if (typeof value !== "object" || value === null) {
        newObj[key] = value;
      } else {
        newObj[key] = removeRedundantValues(value);
      }
    }

    return newObj;
  }

  return obj;
};

export default function handler(req, res) {
  try {
    const condensedData = removeRedundantValues(data);

    res.status(200).json(condensedData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
