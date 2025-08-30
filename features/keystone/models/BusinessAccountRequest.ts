import { list, group, graphql } from '@keystone-6/core';
import { 
  text,
  integer,
  select,
  timestamp,
  relationship,
  virtual
} from '@keystone-6/core/fields';
import { trackingFields } from './trackingFields';
import { permissions, isSignedIn } from '../access';

export const BusinessAccountRequest = list({
  access: {
    operation: {
      query: ({ session }) => {
        // Admins can query all requests
        if (permissions.canManageOrders({ session })) return true;
        // Regular users can query their own requests
        return isSignedIn({ session });
      },
      create: isSignedIn, // Any authenticated user can create requests
      update: permissions.canManageOrders, // Only admins can update/approve
      delete: permissions.canManageOrders, // Only admins can delete
    },
    filter: {
      query: ({ session }) => {
        // Admins can see all requests
        if (permissions.canManageOrders({ session })) return true;
        // Regular users can only see their own requests
        return { user: { id: { equals: session?.itemId } } };
      },
    },
  },
  fields: {
    // Core relationship
    user: relationship({
      ref: 'User.businessAccountRequest',
      many: false,
      validation: { isRequired: true },
    }),
    
    // Request details
    businessName: text({
      validation: { isRequired: true },
    }),
    
    businessType: select({
      options: [
        { label: 'Wholesale Partner', value: 'wholesale' },
        { label: 'Distribution Channel', value: 'distribution' },
        { label: 'Authorized Reseller', value: 'reseller' },
        { label: 'B2B Platform', value: 'b2b_platform' },
        { label: 'Other', value: 'other' }
      ],
      validation: { isRequired: true },
    }),
    
    monthlyOrderVolume: select({
      options: [
        { label: '1-50 orders/month', value: 'low' },
        { label: '51-200 orders/month', value: 'medium' },
        { label: '201-1000 orders/month', value: 'high' },
        { label: '1000+ orders/month', value: 'enterprise' }
      ],
      validation: { isRequired: true },
    }),
    
    requestedCreditLimit: integer({
      validation: { isRequired: true },
      label: 'Requested Credit Limit (in cents)',
    }),
    
    businessDescription: text({
      ui: { displayMode: 'textarea' },
      validation: { isRequired: true },
    }),
    
    // Status tracking
    status: select({
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Not Approved', value: 'not_approved' },
        { label: 'Requires Info', value: 'requires_info' }
      ],
      defaultValue: 'pending',
      validation: { isRequired: true },
    }),
    
    // Admin fields
    reviewedBy: relationship({
      ref: 'User',
      many: false,
      label: 'Reviewed By Admin',
    }),
    
    reviewNotes: text({
      ui: { displayMode: 'textarea' },
      label: 'Admin Review Notes',
    }),
    
    approvedCreditLimit: integer({
      label: 'Approved Credit Limit (in cents)',
    }),
    
    // Timestamps
    submittedAt: timestamp({
      defaultValue: { kind: 'now' },
      validation: { isRequired: true },
    }),
    
    reviewedAt: timestamp(),
    
    // Generated account (once approved)
    generatedAccount: relationship({
      ref: 'Account',
      many: false,
      label: 'Generated Account',
    }),

    // Virtual computed fields
    ...group({
      label: 'Computed Fields',
      description: 'Auto-calculated fields for request display',
      fields: {
        formattedRequestedCredit: virtual({
          field: graphql.field({
            type: graphql.String,
            resolve(item) {
              const amount = (item.requestedCreditLimit || 0) / 100;
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(amount);
            },
          }),
        }),

        formattedApprovedCredit: virtual({
          field: graphql.field({
            type: graphql.String,
            resolve(item) {
              if (!item.approvedCreditLimit) return null;
              const amount = (item.approvedCreditLimit || 0) / 100;
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(amount);
            },
          }),
        }),

        businessTypeLabel: virtual({
          field: graphql.field({
            type: graphql.String,
            resolve(item) {
              const typeMap = {
                wholesale: 'Wholesale Partner',
                distribution: 'Distribution Channel',
                reseller: 'Authorized Reseller',
                b2b_platform: 'B2B Platform',
                other: 'Other'
              };
              return typeMap[item.businessType] || item.businessType;
            },
          }),
        }),

        volumeLabel: virtual({
          field: graphql.field({
            type: graphql.String,
            resolve(item) {
              const volumeMap = {
                low: '1-50 orders/month',
                medium: '51-200 orders/month',
                high: '201-1000 orders/month',
                enterprise: '1000+ orders/month'
              };
              return volumeMap[item.monthlyOrderVolume] || item.monthlyOrderVolume;
            },
          }),
        }),

        statusLabel: virtual({
          field: graphql.field({
            type: graphql.String,
            resolve(item) {
              const statusMap = {
                pending: 'Pending Review',
                approved: 'Approved',
                not_approved: 'Not Approved',
                requires_info: 'Requires Additional Information'
              };
              return statusMap[item.status] || item.status;
            },
          }),
        }),
      },
    }),

    ...trackingFields,
  },
  
  hooks: {
    beforeOperation: async ({ operation, item, originalItem, inputData, context }) => {
      console.log('=== BusinessAccountRequest beforeOperation Hook ===');
      console.log('operation:', operation);
      console.log('inputData:', JSON.stringify(inputData, null, 2));
      
      if (operation === 'update' && inputData?.where?.id) {
        console.log('🔍 Fetching current item with ID:', inputData.where.id);
        
        // Get the current item to check status change
        const currentItem = await context.sudo().query.BusinessAccountRequest.findOne({
          where: { id: inputData.where.id },
          query: 'id status'
        });
        
        console.log('🎯 currentItem:', JSON.stringify(currentItem, null, 2));
        console.log('📥 inputData.data.status:', inputData.data?.status);
        
        // When request is being approved, create account first
        if (inputData.data?.status === 'approved' && 
            currentItem?.status !== 'approved') {
          
          console.log('✅ Hook conditions met - calling createAccountFromApprovedRequest');
          const accountId = await createAccountFromApprovedRequest(
            { id: inputData.where.id, ...inputData.data }, 
            context
          );
          
          if (accountId) {
            console.log('🔗 Adding generated account to input data:', accountId);
            // Add the generated account to the input data
            inputData.data.generatedAccount = { connect: { id: accountId } };
            console.log('📝 Updated inputData.data:', JSON.stringify(inputData.data, null, 2));
          }
        } else {
          console.log('❌ Hook conditions not met');
          console.log('  - inputData.data?.status === "approved":', inputData.data?.status === 'approved');
          console.log('  - currentItem?.status !== "approved":', currentItem?.status !== 'approved');
        }
      } else {
        console.log('❌ Not an update operation or missing where.id');
      }
    }
  }
});

// Helper function to create account from approved request
async function createAccountFromApprovedRequest(request: any, context: any): Promise<string | null> {
  console.log('🔄 Starting createAccountFromApprovedRequest');
  console.log('request.id:', request.id);
  
  try {
    // Get the request with user data
    console.log('📝 Fetching full request data...');
    const fullRequest = await context.sudo().query.BusinessAccountRequest.findOne({
      where: { id: request.id },
      query: `
        id
        businessName
        businessType
        approvedCreditLimit
        user {
          id
          email
          name
        }
      `
    });

    console.log('fullRequest:', JSON.stringify(fullRequest, null, 2));

    if (!fullRequest) {
      console.error('❌ Full request not found!');
      return null;
    }

    // Get default currency (assume USD for now, could be made configurable)
    console.log('💰 Looking for USD currency...');
    const defaultCurrency = await context.sudo().query.Currency.findOne({
      where: { code: 'usd' },
      query: 'id code'
    });

    console.log('defaultCurrency:', defaultCurrency);

    if (!defaultCurrency) {
      console.error('❌ Default USD currency not found');
      return null;
    }

    // Create account
    console.log('🏦 Creating business account...');
    const account = await context.sudo().query.Account.createOne({
      data: {
        user: { connect: { id: fullRequest.user.id } },
        title: 'Business Account',
        description: `Running business account for automated orders placed through API integration - ${fullRequest.businessName}`,
        currency: { connect: { id: defaultCurrency.id } },
        status: 'active',
        creditLimit: request.approvedCreditLimit || fullRequest.approvedCreditLimit || 100000,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        accountType: 'business',
        metadata: {
          createdFromRequest: fullRequest.id,
          businessType: fullRequest.businessType,
          businessName: fullRequest.businessName,
          approvedCreditLimit: request.approvedCreditLimit || fullRequest.approvedCreditLimit
        }
      }
    });

    console.log('✅ Account created:', JSON.stringify(account, null, 2));

    // Generate customer token
    console.log('🔑 Generating customer token...');
    const customerToken = generateSecureToken();
    console.log('Generated token:', customerToken);
    
    // Update user with customer token
    console.log('👤 Updating user with customer token...');
    await context.sudo().query.User.updateOne({
      where: { id: fullRequest.user.id },
      data: {
        customerToken: customerToken,
        tokenGeneratedAt: new Date().toISOString()
      }
    });
    
    console.log('✅ User updated with customer token');
    
    // TODO: Send approval email to user
    console.log(`Account created for user ${fullRequest.user.email}, token: ${customerToken}`);
    
    return account.id;
    
  } catch (error) {
    console.error('Error creating account from approved request:', error);
    return null;
  }
}

// Secure token generation function
function generateSecureToken(): string {
  const crypto = require('crypto');
  return 'ctok_' + crypto.randomBytes(32).toString('hex');
}