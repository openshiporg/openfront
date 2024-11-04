"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getCartId } from "@lib/cookies";
import { getRegion } from "@storefront/lib/data";
import { updateCart } from "@storefront/modules/cart/actions";

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode, currentPath) {
  const cartId = getCartId();
  const region = await getRegion(countryCode);

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`);
  }

  if (cartId) {
    await updateCart({ region: { connect: { id: region.id } } });
  }

  revalidateTag("regions");
  revalidateTag("products");

  redirect(`/${countryCode}${currentPath}`);
}

export async function resetOnboardingState(orderId) {
  cookies().set("_openfront_onboarding", "false", { maxAge: -1 });
  redirect(`http://localhost:7001/a/orders/${orderId}`);
}
