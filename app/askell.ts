import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const Plan = z
  .object({
    id: z.number().int(),
    name: z.string(),
    alternative_name: z.string().nullable(),
    reference: z.string().nullable(),
    interval: z.string(),
    interval_count: z.number().int(),
    amount: z.string(),
    currency: z.string(),
    trial_period_days: z.number().int(),
    description: z.string(),
    enabled: z.boolean(),
    private: z.boolean(),
    electronic_only: z.boolean(),
  })
  .partial();
const Transaction = z
  .object({
    uuid: z.string().uuid(),
    data: z.object({}).partial(),
    state: z.enum([
      "failed",
      "settled",
      "inital",
      "pending",
      "canceled",
      "refunded",
    ]),
    amount: z.string(),
    currency: z.string(),
  })
  .partial();
const CustomerCreate = z.object({
  first_name: z.string().max(128),
  last_name: z.string().max(128),
  email: z.string().max(254),
  customer_reference: z.string().max(256),
});
const PaymentMethod = z
  .object({
    verified: z.boolean(),
    canceled: z.boolean(),
    valid_until: z.string().datetime(),
    display_info: z.string(),
  })
  .partial();
const Customer = CustomerCreate.and(
  z
    .object({ id: z.number().int(), payment_method: z.array(PaymentMethod) })
    .partial()
);
const inline_response_400 = z
  .object({ status: z.string(), error: z.string() })
  .partial();
const BillingLog = z
  .object({
    id: z.number().int(),
    billing_log_type: z.enum(["trial", "renewal"]),
    billing_date: z.string().datetime(),
    plan_billed_up_to: z.string().datetime(),
    total: z.string().nullable(),
    transaction: Transaction,
  })
  .partial();
const Subscription = z
  .object({
    id: z.number().int(),
    trial_end: z.string().datetime().nullable(),
    start_date: z.string().datetime().nullable(),
    ended_at: z.string().datetime().nullable(),
    active_until: z.string().datetime(),
    reference: z.string(),
    description: z.string().nullable(),
    is_on_trial: z.boolean(),
    active: z.boolean(),
    meta: z.string(),
    token: z.string(),
    customer: z.union([Customer, z.number()]),
    billing_logs: z.array(BillingLog),
  })
  .partial();
const SubscriptionCreate = z.object({
  plan: z.number().int(),
  reference: z.string(),
  start_date: z.string().datetime().optional(),
  amount: z.string().optional(),
  discount: z.string().optional(),
});
const CustomerAddPaymentMethod = z.object({
  customer_reference: z.string(),
  token: z.string(),
});
const PaymentMethodTokenCreate = z.object({ token: z.string() }).partial();
const SubscriptionCreateMulti = z
  .object({
    customer: CustomerCreate,
    payment_method: PaymentMethodTokenCreate,
    subscriptions: z.array(SubscriptionCreate),
  })
  .partial();
const inline_response_201 = z
  .object({ customer: Customer, subscriptions: z.array(Subscription) })
  .partial();
const inline_response_200_1 = z.object({ state: z.string() }).partial();
const inline_response_200_2 = z.object({ state: z.string() }).partial();
const PaymentMethodCreate = z.object({
  card_number: z.string(),
  expiration_year: z.string().max(2),
  expiration_month: z.string().max(2),
  cvv_number: z.string(),
  plan: z.number().int().optional(),
});
const inline_response_201_2 = z
  .object({ token: z.string(), card_verification_url: z.string() })
  .partial();
const Payment = z
  .object({
    uuid: z.string().uuid(),
    amount: z.string(),
    currency: z.string(),
    description: z.string(),
    reference: z.string(),
    state: z.enum(["failed", "settled", "pending", "retrying"]),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    transactions: z.array(Transaction),
  })
  .partial();
const PaymentCreate = z.object({
  customer_reference: z.string(),
  amount: z.string(),
  currency: z.string(),
  description: z.string().optional(),
  reference: z.string().optional(),
});
const PaymentInitial = z
  .object({
    uuid: z.string().uuid(),
    amount: z.string(),
    currency: z.string(),
    description: z.string(),
    reference: z.string(),
    state: z.enum(["failed", "settled", "pending", "retrying"]),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    transactions: z.array(Transaction),
  })
  .partial();
const SubscriptionNoBillingLog = z
  .object({
    id: z.number().int(),
    trial_end: z.string().datetime().nullable(),
    start_date: z.string().datetime().nullable(),
    ended_at: z.string().datetime().nullable(),
    active_until: z.string().datetime().nullable(),
    reference: z.string(),
    description: z.string(),
    is_on_trial: z.boolean(),
    active: z.boolean(),
    meta: z.string(),
    token: z.string(),
    customer: Customer,
  })
  .partial();
const postYourWebhookUrl_Body = z
  .object({
    customer: Customer,
    subscriptions: z.array(SubscriptionNoBillingLog),
  })
  .partial();

export const schemas = {
  Plan,
  Transaction,
  CustomerCreate,
  PaymentMethod,
  Customer,
  inline_response_400,
  BillingLog,
  Subscription,
  SubscriptionCreate,
  CustomerAddPaymentMethod,
  PaymentMethodTokenCreate,
  SubscriptionCreateMulti,
  inline_response_201,
  inline_response_200_1,
  inline_response_200_2,
  PaymentMethodCreate,
  inline_response_201_2,
  Payment,
  PaymentCreate,
  PaymentInitial,
  SubscriptionNoBillingLog,
  postYourWebhookUrl_Body,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/customers/",
    description: `Lists all customers. Requires a secret key.`,
    requestFormat: "json",
    response: z.array(Customer),
    errors: [
      {
        status: 400,
        description: `Invalid status value`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/customers/",
    description: `Create a customer in Áskell. Requires a secret key. To make it easier linking customers to existing  systems, it is your responsibility to assign a reference to the customer so that you can look  them up later. This can be an id, a UUID or whatever suits you. It&#x27;s best to keep it simple.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Customer object`,
        type: "Body",
        schema: CustomerCreate,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid status value`,
        schema: inline_response_400,
      },
    ],
  },
  {
    method: "get",
    path: "/customers/:customerReference/",
    description: `Get a customer which has already been created. You need to supply your chosen customer reference. Requires a secret key.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "customerReference",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Customer,
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/customers/:customerReference/",
    description: `Update a customer which has already been created. You must supply all required fields. Requires a secret key.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "customerReference",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/customers/:customerReference/",
    description: `Delete a customer. Requires a secret key.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "customerReference",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/customers/:customerReference/",
    description: `Update a customer which has already been created. All fields are optional. Requires a secret key.`,
    requestFormat: "json",
    parameters: [
      {
        name: "customerReference",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/customers/:customerReference/subscriptions/",
    requestFormat: "json",
    parameters: [
      {
        name: "customerReference",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.array(Subscription),
  },
  {
    method: "post",
    path: "/customers/:customerReference/subscriptions/add/",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Customer add subscription object`,
        type: "Body",
        schema: SubscriptionCreate,
      },
      {
        name: "customerReference",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid status value`,
        schema: inline_response_400,
      },
    ],
  },
  {
    method: "post",
    path: "/customers/paymentmethod/",
    description: `Requires a secret key. You must first acquire a temporary payment method token using &#x60;/temporarypaymentmethod/&#x60; and use that in your post body.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CustomerAddPaymentMethod,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid status value`,
        schema: inline_response_400,
      },
      {
        status: 404,
        description: `Customer not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/payments/",
    description: `Lists all payments. Requires a secret key.`,
    requestFormat: "json",
    response: z.array(Payment),
    errors: [
      {
        status: 400,
        description: `Invalid status value`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/payments/",
    description: `Create a single payment in Áskell. Requires a secret key. A payment is executed asynchronously which means that you will have to rely on checking the status of the payment after creating it, or rely on webhooks. You can check the status of the payment using the uuid supplied when the payment is initially created.

Initially, the payment will have the state &#x27;pending&#x27;. If the payment is successful, the state will be &#x27;settled&#x27;. If the payment fails, the state will be &#x27;failed&#x27;.
 If you decide to retry the payment, the payment might have the state &#x27;retrying&#x27;.

To summarize, the four states are:

* pending
* settled
* failed
* retrying

`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Payment object`,
        type: "Body",
        schema: PaymentCreate,
      },
    ],
    response: PaymentInitial,
    errors: [
      {
        status: 400,
        description: `Invalid status value`,
        schema: inline_response_400,
      },
    ],
  },
  {
    method: "post",
    path: "/payments/:uuid/retry/",
    description: `If a Payment is in the failed state, you can retry it up to 4 times. Requires a secret key.`,
    requestFormat: "json",
    parameters: [
      {
        name: "uuid",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(Payment),
    errors: [
      {
        status: 400,
        description: `Invalid status value`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/plans/",
    description: `Lists all plans. Requires a secret key.`,
    requestFormat: "json",
    response: z.array(Plan),
  },
  {
    method: "get",
    path: "/subscriptions/",
    requestFormat: "json",
    response: z.array(Subscription),
  },
  {
    method: "get",
    path: "/subscriptions/:subscriptionId/",
    requestFormat: "json",
    parameters: [
      {
        name: "subscriptionId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Subscription,
  },
  {
    method: "post",
    path: "/subscriptions/:subscriptionId/activate/",
    requestFormat: "json",
    parameters: [
      {
        name: "subscriptionId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ state: z.string() }).partial(),
    errors: [
      {
        status: 400,
        description: `Invalid status value`,
        schema: inline_response_400,
      },
    ],
  },
  {
    method: "post",
    path: "/subscriptions/:subscriptionId/cancel/",
    requestFormat: "json",
    parameters: [
      {
        name: "subscriptionId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({ state: z.string() }).partial(),
    errors: [
      {
        status: 400,
        description: `Invalid status value`,
        schema: inline_response_400,
      },
    ],
  },
  {
    method: "post",
    path: "/subscriptions/multi/",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SubscriptionCreateMulti,
      },
    ],
    response: inline_response_201,
    errors: [
      {
        status: 400,
        description: `Invalid status value`,
        schema: inline_response_400,
      },
    ],
  },
  {
    method: "post",
    path: "/temporarypaymentmethod/",
    description: `The resulting &#x60;token&#x60; is a reference to a temporary payment method. You have to confirm this payment method by e.g. using it to activate a subscription, or adding a new payment method to a customer. Requires a public api key.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PaymentMethodCreate,
      },
    ],
    response: inline_response_201_2,
    errors: [
      {
        status: 400,
        description: `Invalid status value`,
        schema: inline_response_400,
      },
    ],
  },
  {
    method: "get",
    path: "/temporarypaymentmethod/:token/",
    description: `When the &#x27;status&#x27; attribute of the response returns &#x27;success&#x27;, you can use the token to confirm payments.`,
    requestFormat: "json",
    parameters: [
      {
        name: "token",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: inline_response_201_2,
    errors: [
      {
        status: 400,
        description: `Invalid status value`,
        schema: inline_response_400,
      },
    ],
  },
  {
    method: "get",
    path: "/transactions/:uuid/receipt/",
    description: `Create a receipt for transaction. Requires a secret key.`,
    requestFormat: "json",
    parameters: [
      {
        name: "uuid",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.array(Transaction),
    errors: [
      {
        status: 400,
        description: `Invalid status value`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/your-webhook-url/",
    description: `We recommend that you verify all calls from us to your webhook endpoints. We sign each request with the &#x60;Hook-HMAC&#x60; header. The value is a HMAC digest derived from the body of the request and a secret key only known by the API and you. We also supply the type of event in the &#x60;Hook-Event&#x60; header.

Here is a sample implementation in Python. This process is very similar to the one Shopify uses so more information can possibly be gleaned from their [documentation](https://shopify.dev/tutorials/manage-webhooks#verify-webhook).
&#x60;&#x60;&#x60;
import base64
import hmac
import hashlib

WEBHOOK_SECRET &#x3D; &quot;Your webhook secret&quot;.encode()
WEBHOOK_DIGEST_TYPE &#x3D; &#x27;sha512&#x27;

def verify(hmac_header, digest_method, secret, message):
   digestmod &#x3D; getattr(hashlib, digest_method)
   signed &#x3D; base64.b64encode(
       hmac.new(secret, message, digestmod).digest(),
   ).strip()
   return hmac.compare_digest(signed, hmac_header)

# your view function
def handle_webhook(request):
   # The signature
   digest &#x3D; request.META.get(&#x27;HTTP_HOOK_HMAC&#x27;).encode()
   # The name of the webhook event
   event &#x3D; request.META.get(&#x27;HTTP_HOOK_EVENT&#x27;).encode()

   body &#x3D; request.body
   if verify(digest, WEBHOOK_DIGEST_TYPE, WEBHOOK_SECRET, body):
       payload &#x3D; json.loads(body)
       # ... the rest of your code here&#x60;&#x60;&#x60;
`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Response when creating multiple subscriptions for one customer`,
        type: "Body",
        schema: postYourWebhookUrl_Body,
      },
    ],
    response: z.void(),
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
