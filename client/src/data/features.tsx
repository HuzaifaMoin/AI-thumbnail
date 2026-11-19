import type { IFeature } from "../types";
// Served from /public
const zapIcon = "/zap-icon.svg";
// Served from /public
const thumbIcon = "/thumb-icon.svg";
// Served from /public
const shapeIcon = "/shape-icon.svg";

export const featuresData: IFeature[] = [
    {
        icon: zapIcon,
        title: "Smart Analysis",
        description: "Launch production-ready thumbnails in minutes with prebuilt components.",
    },
    {
        icon: thumbIcon,
        title: "Pixel perfect",
        description: "Modern Figma-driven UI that translates to exact code.",
    },
    {
        icon: shapeIcon,
        title: "Highly customizable",
        description: "Tailwind utility-first classes make customization trivial.",
    }
];