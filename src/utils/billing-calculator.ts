import type { ActiveCall } from "../hooks/use-service-manager";

export const BASE_FEE_INITIAL_CALL = 120.0;
export const FEE_PER_EXTRA_ACTIVE = 20.0;
export const TIME_LIMIT_INITIAL_MINUTES = 120;
export const FEE_PER_EXTRA_HOUR = 20.0;

export interface BillingResult {
  totalActiveCount: number;
  totalFee: number;
  detailsByStore: Record<string, { count: number; fee: number }>;
}

const normalizeStoreCode = (codigoLoja: string | undefined) =>
  codigoLoja && codigoLoja.trim().length
    ? codigoLoja.trim()
    : "Loja não informada";

export function calculateBilling(activeCalls: ActiveCall[]): BillingResult {
  const detailsByStore = activeCalls.reduce<
    Record<string, { count: number; fee: number }>
  >((accumulator, call) => {
    const storeCode = normalizeStoreCode(call.codigoLoja);
    const entry = accumulator[storeCode] ?? { count: 0, fee: 0 };
    const nextCount = entry.count + 1;
    const nextFee =
      nextCount === 1
        ? BASE_FEE_INITIAL_CALL
        : BASE_FEE_INITIAL_CALL + (nextCount - 1) * FEE_PER_EXTRA_ACTIVE;

    accumulator[storeCode] = {
      count: nextCount,
      fee: nextFee,
    };

    return accumulator;
  }, {});

  const totalActiveCount = activeCalls.length;
  const totalFee = Object.values(detailsByStore).reduce(
    (sum, { fee }) => sum + fee,
    0,
  );

  return {
    totalActiveCount,
    totalFee,
    detailsByStore,
  };
}
