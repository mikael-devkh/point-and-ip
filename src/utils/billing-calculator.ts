export const BASE_FEE_INITIAL_CALL = 120.0;
export const FEE_PER_EXTRA_ACTIVE = 20.0;
export const TIME_LIMIT_INITIAL_MINUTES = 120;
export const FEE_PER_EXTRA_HOUR = 20.0;

export interface BillingResult {
  baseFee: number;
  extraActiveFee: number;
  totalActiveCount: number;
  totalFee: number;
}

export function calculateBilling(activeCallCount: number): BillingResult {
  const normalizedCount = Math.max(0, activeCallCount);
  const extraCount = Math.max(0, normalizedCount - 1);
  const extraActiveFee = extraCount * FEE_PER_EXTRA_ACTIVE;
  const totalFee = BASE_FEE_INITIAL_CALL + extraActiveFee;

  return {
    baseFee: BASE_FEE_INITIAL_CALL,
    extraActiveFee,
    totalActiveCount: normalizedCount,
    totalFee,
  };
}
