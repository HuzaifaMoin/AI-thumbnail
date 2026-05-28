import type { IFeature } from "../types";
import zapIcon from "../assets/zap-icon.svg";
import thumbIcon from "../assets/thumb-icon.svg";
import shapeIcon from "../assets/shape-icon.svg";

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