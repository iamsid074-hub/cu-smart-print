// Define the end time for the India Victory Celebration Offer
// Ends essentially 3 days from the time it was deployed (March 11, 2026 at midnight)
export const OFFER_END_TIME = new Date("2026-03-11T23:59:59+05:30").getTime();

export function isOfferActive() {
    return Date.now() < OFFER_END_TIME;
}
