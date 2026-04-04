#!/bin/bash

DEPLOY_OUTPUT=$(npx prisma migrate deploy 2>&1)
DEPLOY_EXIT=$?

if [ $DEPLOY_EXIT -eq 0 ]; then
  echo "$DEPLOY_OUTPUT"
  exit 0
fi

if ! echo "$DEPLOY_OUTPUT" | grep -q "20250626171359_initial_migration"; then
  echo "$DEPLOY_OUTPUT"
  exit $DEPLOY_EXIT
fi

echo "$DEPLOY_OUTPUT"
echo ""
echo "Detected known failed migration: 20250626171359_initial_migration"
echo "Schema is already fully applied. Resolving migration history..."

MIGRATIONS=(
  "20250626171359_initial_migration"
  "20250629043812_add_description_to_claim_tag_and_url_to_claim_image"
  "20250806020425_add_webhooks"
  "20250806175510_add_o_auth_models"
  "20250808204326_update_o_auth_token_to_have_user_field"
  "20250810223739_remove_unused_o_auth_model"
  "20250811215959_add_metadata_to_oauth_apps"
  "20250814193358_add_home_page_title_and_description_to_store_model"
  "20250819065138_upgrade_api_keys_to_show_token_once"
  "20250819164007_update_api_key_model"
  "20250826172434_add_invoicing_system"
  "20250827182505_update_invoice_model"
  "20250827202455_update_account_region_relationships"
  "20250827215547_add_business_account_model"
  "20250828082212_add_unique_constraint_to_user_customer_token"
  "20250828105432_remove_customer_token_unique"
  "20250830052718_add_order_webhook_url_to_user"
  "20250902221649_add_payment_collections_to_invoice_table"
  "20250915182512_add_primary_image_to_product_variant_model"
  "20250927230424_add_order_to_product_image_model"
  "20251003161755_add_logo_to_store_model"
)

for MIGRATION in "${MIGRATIONS[@]}"; do
  RESULT=$(npx prisma migrate resolve --applied "$MIGRATION" 2>&1)
  RESOLVE_EXIT=$?
  if [ $RESOLVE_EXIT -eq 0 ]; then
    echo "Resolved as applied: $MIGRATION"
  elif echo "$RESULT" | grep -q "P3008\|already recorded as applied"; then
    echo "Already applied: $MIGRATION"
  else
    echo "Error resolving $MIGRATION: $RESULT"
    exit 1
  fi
done

echo "Migration history resolved. Running prisma migrate deploy..."
npx prisma migrate deploy
exit $?
