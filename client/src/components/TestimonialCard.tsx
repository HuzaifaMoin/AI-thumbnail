import { motion } from "motion/react";
import type { TestimonialCardProps } from "../types";

export default function TestimonialCard({
    testimonial,
    index,
}: TestimonialCardProps) {
    return (
        <motion.div
            className="p-4 rounded-lg w-72 shrink-0 bg-pink-950/30 border border-pink-950 mx-3 h-auto"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: index * 0.15,
                type: "spring",
                stiffness: 320,
                damping: 70,
            }}
        >
            {/* HEADER */}
            <div className="flex gap-2 items-center">
                <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                />

                <div>
                    <div className="flex items-center gap-1">
                        <p className="text-white">{testimonial.name}</p>

                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                        >
                            <path
                                d="M4.5 6l1.2 1.2L8 4.9"
                                stroke="#2196F3"
                                strokeWidth="1.5"
                            />
                        </svg>
                    </div>

                    <span className="text-xs text-slate-400">
                        {testimonial.handle}
                    </span>
                </div>
            </div>

            {/* QUOTE */}
            <p className="text-sm pt-4 text-slate-300">
                {testimonial.quote}
            </p>
        </motion.div>
    );
}