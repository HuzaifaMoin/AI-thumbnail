import type { IPricing } from "../types";

export const pricingData: IPricing[] = [
    {
        name: "Basic",
        price: 29,
        period: "month",
        features: [
            "50 AI Thumbnails per month",
            "Basic Thumbnail templates",
            "Standard Resolution",
            "No Watermark",
            "Email Support"
        ],
        mostPopular: false
    },
    {
        name: "Pro",
        price: 79,
        period: "month",
        features: [
            "200 AI Thumbnails per month",
            "Premium Thumbnail templates",
            "High Resolution",
            "No Watermark",
            "Priority Email Support"
        ],
        mostPopular: true
    },
    {
        name: "Enterprise",
        price: 199,
        period: "month",
        features: [
            "Unlimited AI Thumbnails",
            "Custom Thumbnail templates",
            "Ultra High Resolution",
            "No Watermark",
            "Dedicated Support"
        ],
        mostPopular: false
    }
];