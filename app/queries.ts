import { isErrorFromPath } from "@zodios/core";

import { askell } from "~/lib/api";
import {
  getContractManagementUrl,
  getContractStatus,
  getSubscriptionContracts,
  type ContractState,
} from "~/lib/askell-v2";

import { User } from "../schema";

/**
 * Normalized view of a customer's subscription, regardless of whether it
 * lives in Áskell's v2 contracts API or the legacy subscriptions API.
 */
export type Subscription = {
  id: number;
  /** Which Áskell API the record came from. Decides which cancel endpoint to use. */
  source: "contract" | "legacy";
  state: ContractState;
  /** Customer currently has access (active, or cancelled but not yet expired). */
  isActive: boolean;
  /** Subscription has been cancelled and will not renew. */
  isCancelled: boolean;
  /** Date the current access period ends. Only shown when cancelled. */
  activeUntil: Date | null;
  /** Next automatic renewal date, when the subscription is still renewing. */
  nextBillingAt: Date | null;
  /** Áskell's customer-facing page for changing payment method, when available. */
  managementUrl: string | null;
};

export type Plan = Awaited<ReturnType<typeof getPlans>>[0];

/**
 * Reads the customer's subscriptions from Áskell.
 *
 * Samstöðin was migrated to v2 subscription contracts, so the v2 API is the
 * source of truth. The legacy subscriptions API is still consulted as a
 * fallback for customers that were never migrated, and if the v2 request
 * itself fails.
 */
export async function getSubscriptions(user: User): Promise<Subscription[]> {
  const contracts = await getSubscriptionContracts(user.kennitala).catch(
    (error: unknown) => {
      console.error("[queries] Askell v2 contracts request failed", error);
      return null;
    },
  );

  if (contracts && contracts.length > 0) {
    const now = new Date();
    return contracts.map((contract) => {
      const { endsAt, isActive, isCancelled, state } = getContractStatus(
        contract,
        now,
      );

      return {
        id: contract.id,
        source: "contract",
        state,
        isActive,
        isCancelled,
        activeUntil: endsAt,
        nextBillingAt: isCancelled ? null : contract.next_billing_at,
        managementUrl: getContractManagementUrl(contract),
      } satisfies Subscription;
    });
  }

  return (await getLegacySubscriptions(user)).map((subscription) => {
    const activeUntil = subscription.active_until ?? null;
    const isCancelled =
      subscription.cancelled === true || subscription.ended_at != null;

    return {
      id: subscription.id ?? 0,
      source: "legacy",
      state: isCancelled
        ? "cancelled"
        : subscription.active === true
          ? "active"
          : "inactive",
      isActive: subscription.active === true,
      isCancelled,
      activeUntil,
      nextBillingAt: isCancelled ? null : activeUntil,
      managementUrl: subscription.token
        ? `https://askell.is/change_subscription/${subscription.token}`
        : null,
    } satisfies Subscription;
  });
}

async function getLegacySubscriptions(user: User) {
  return await askell
    .get("/customers/:customerReference/subscriptions/", {
      params: { customerReference: user.kennitala },
    })
    .catch((error: unknown) => {
      // A customer that Áskell has never seen simply has no subscriptions.
      if (
        isErrorFromPath(
          askell.api,
          "get",
          "/customers/:customerReference/subscriptions/",
          error,
        )
      ) {
        return [];
      }
      console.error(
        "[queries] Askell legacy subscriptions request failed",
        error,
      );
      return [];
    });
}

export async function getPlans() {
  return await askell.get("/plans/");
}
