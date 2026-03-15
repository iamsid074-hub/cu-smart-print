// India Victory Celebration Offer
// Ends March 11, 2026 at midnight IST
export const OFFER_END_TIME = new Date("2026-03-11T23:59:59+05:30").getTime();

export const PROMO_CODE = "INDWIN12";

export function isOfferActive() {
    return Date.now() < OFFER_END_TIME;
}

/** Returns true if the code matches INDWIN12 AND the 3-day offer is still active */
export function validatePromo(code: string): boolean {
    return code.trim().toUpperCase() === PROMO_CODE && isOfferActive();
}

/** Returns a flat delivery fee of 29 */
export function getDeliveryFee(promoApplied: boolean): number {
    return 29;
}
