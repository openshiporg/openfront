"use server";
import {
  addShippingAddress,
  authenticate,
  createCustomer,
  deleteShippingAddress,
  getToken,
  updateCustomer,
  updateShippingAddress,
} from "@storefront/lib/data"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { cookies, headers } from "next/headers"

export async function signUp(_currentState, formData) {
  const customer = {
    email: formData.get("email"),
    password: formData.get("password"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone")
  }

  try {
    await createCustomer(customer)
    await getToken({ email: customer.email, password: customer.password }).then(() => {
      revalidateTag("customer")
    })
  } catch (error) {
    return error.toString();
  }
}

export async function logCustomerIn(
  _currentState,
  formData
) {
  const email = formData.get("email")
  const password = formData.get("password")

  try {
    await getToken({ email, password }).then(() => {
      revalidateTag("customer")
    })
  } catch (error) {
    return error.toString();
  }
}

export async function updateCustomerName(
  _currentState,
  formData
) {
  const customer = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name")
  }

  try {
    await updateCustomer(customer).then(() => {
      revalidateTag("customer")
    })
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

export async function updateCustomerEmail(
  _currentState,
  formData
) {
  const customer = {
    email: formData.get("email")
  }

  try {
    await updateCustomer(customer).then(() => {
      revalidateTag("customer")
    })
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

export async function updateCustomerPhone(
  _currentState,
  formData
) {
  const customer = {
    phone: formData.get("phone")
  }

  try {
    await updateCustomer(customer).then(() => {
      revalidateTag("customer")
    })
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

export async function updateCustomerPassword(
  currentState,
  formData
) {
  const email = currentState.customer.email
  const new_password = formData.get("new_password")
  const old_password = formData.get("old_password")
  const confirm_password = formData.get("confirm_password")

  const isValid = await authenticate({ email, password: old_password })
    .then(() => true)
    .catch(() => false)

  if (!isValid) {
    return {
      customer: currentState.customer,
      success: false,
      error: "Old password is incorrect",
    }
  }

  if (new_password !== confirm_password) {
    return {
      customer: currentState.customer,
      success: false,
      error: "Passwords do not match",
    }
  }

  try {
    await updateCustomer({ password: new_password }).then(() => {
      revalidateTag("customer")
    })

    return {
      customer: currentState.customer,
      success: true,
      error: null,
    }
  } catch (error) {
    return {
      customer: currentState.customer,
      success: false,
      error: error.toString(),
    };
  }
}

export async function addCustomerShippingAddress(
  _currentState,
  formData
) {
  const customer = {
    address: {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      company: formData.get("company"),
      address_1: formData.get("address_1"),
      address_2: formData.get("address_2"),
      city: formData.get("city"),
      postal_code: formData.get("postal_code"),
      province: formData.get("province"),
      country_code: formData.get("country_code"),
      phone: formData.get("phone"),
    }
  }

  try {
    await addShippingAddress(customer).then(() => {
      revalidateTag("customer")
    })
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

export async function updateCustomerShippingAddress(
  currentState,
  formData
) {
  const addressId = currentState.addressId

  const address = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    address_1: formData.get("address_1"),
    address_2: formData.get("address_2"),
    company: formData.get("company"),
    city: formData.get("city"),
    postal_code: formData.get("postal_code"),
    province: formData.get("province"),
    country_code: formData.get("country_code"),
    phone: formData.get("phone")
  }

  try {
    await updateShippingAddress(addressId, address).then(() => {
      revalidateTag("customer")
    })
    return { success: true, error: null, addressId }
  } catch (error) {
    return { success: false, error: error.toString(), addressId };
  }
}

export async function deleteCustomerShippingAddress(addressId) {
  try {
    await deleteShippingAddress(addressId).then(() => {
      revalidateTag("customer")
    })
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

export async function updateCustomerBillingAddress(
  _currentState,
  formData
) {
  const customer = {
    billing_address: {
      first_name: formData.get("billing_address.first_name"),
      last_name: formData.get("billing_address.last_name"),
      company: formData.get("billing_address.company"),
      address_1: formData.get("billing_address.address_1"),
      address_2: formData.get("billing_address.address_2"),
      city: formData.get("billing_address.city"),
      postal_code: formData.get("billing_address.postal_code"),
      province: formData.get("billing_address.province"),
      country_code: formData.get("billing_address.country_code"),
      phone: formData.get("billing_address.phone"),
    }
  }

  try {
    await updateCustomer(customer).then(() => {
      revalidateTag("customer")
    })
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

export async function signOut() {
  cookies().set("_openfront_jwt", "", {
    maxAge: -1,
  })
  const countryCode = headers().get("next-url")?.split("/")[1] || ""
  revalidateTag("auth")
  revalidateTag("customer")
  redirect(`/${countryCode}/account`)
}
