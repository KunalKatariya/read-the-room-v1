
export const PRICING_TIERS = {
    DEFAULT: { currency: "USD", symbol: "$", amount: 299, display: "$2.99" },
    IN: { currency: "INR", symbol: "₹", amount: 15000, display: "₹150" }, // Stripe uses smallest unit (paise)
    GB: { currency: "GBP", symbol: "£", amount: 249, display: "£2.49" },
    EU: { currency: "EUR", symbol: "€", amount: 299, display: "€2.99" },
    CA: { currency: "CAD", symbol: "CA$", amount: 399, display: "CA$3.99" },
    AU: { currency: "AUD", symbol: "AU$", amount: 449, display: "AU$4.49" },
    JP: { currency: "JPY", symbol: "¥", amount: 289, display: "¥289" },
};

export const getPricingForCountry = (countryCode: string) => {
    // 1. Direct Country Match
    if (PRICING_TIERS[countryCode as keyof typeof PRICING_TIERS]) {
        return PRICING_TIERS[countryCode as keyof typeof PRICING_TIERS];
    }

    // 2. Eurozone Helper (Simple list of major EU countries)
    const EUROZONE = ["DE", "FR", "IT", "ES", "NL", "BE", "PT", "IE", "AT", "FI", "GR"];
    if (EUROZONE.includes(countryCode)) {
        return PRICING_TIERS.EU;
    }

    // 3. Fallback
    return PRICING_TIERS.DEFAULT;
};
