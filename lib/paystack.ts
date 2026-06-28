const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  console.warn("⚠️  PAYSTACK_SECRET_KEY is not configured in environment variables.");
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string; // 'success', 'failed', 'ongoing'
    reference: string;
    amount: number; // in subunits (kobo/cents)
    currency: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    metadata: any;
    customer: {
      email: string;
    };
  };
}

/**
 * Initialize a Paystack transaction.
 * Default currency is GHS, amount is in the specified currency.
 */
export async function initializePaystackTransaction(
  email: string,
  amount: number,
  metadata: any,
  callbackUrl: string,
  currency: string = "GHS"
): Promise<{ authorization_url: string; reference: string }> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key is not configured.");
  }

  // Paystack expects amounts in subunits (e.g. pesewas/cents, so multiply by 100)
  const amountSubunit = Math.round(amount * 100);

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountSubunit,
      currency,
      callback_url: callbackUrl,
      metadata,
    }),
  });

  const body = (await response.json()) as PaystackInitializeResponse;

  if (!response.ok || !body.status) {
    throw new Error(`Paystack initialization failed: ${body.message || response.statusText}`);
  }

  return {
    authorization_url: body.data.authorization_url,
    reference: body.data.reference,
  };
}

/**
 * Verify a Paystack transaction by its reference.
 */
export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerifyResponse["data"]> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key is not configured.");
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  });

  const body = (await response.json()) as PaystackVerifyResponse;

  if (!response.ok || !body.status) {
    throw new Error(`Paystack verification failed: ${body.message || response.statusText}`);
  }

  return body.data;
}
