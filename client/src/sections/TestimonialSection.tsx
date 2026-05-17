import SectionTitle from "../components/SectionTitle";
import TestimonialCard from "../components/TestimonialCard";
import { testimonialsData } from "../data/testimonial";
import type { ITestimonial } from "../types";
import Marquee from "react-fast-marquee";

export default function TestimonialSection() {
    return (
        <div
            id="testimonials"
            className="px-4 md:px-16 lg:px-24 xl:px-32 overflow-x-hidden"
        >
            <SectionTitle
                text1="Testimonials"
                text2="Don't just take our words"
                text3="Hear what our users say about us. We're always looking for ways to improve. If you have a positive experience with us, leave a review."
            />

            {/* LEFT MARQUEE */}
            <div className="mt-11 overflow-hidden">
                <Marquee speed={25} gradient={true} gradientColor="#000">
                    {[...testimonialsData, ...testimonialsData].map(
                        (testimonial: ITestimonial, index: number) => (
                            <TestimonialCard
                                key={index}
                                index={index}
                                testimonial={testimonial}
                            />
                        )
                    )}
                </Marquee>
            </div>

            {/* RIGHT MARQUEE */}
            <div className="mt-6 overflow-hidden">
                <Marquee
                    speed={25}
                    direction="right"
                    gradient={true}
                    gradientColor="#000"
                >
                    {[...testimonialsData, ...testimonialsData].map(
                        (testimonial: ITestimonial, index: number) => (
                            <TestimonialCard
                                key={index}
                                index={index}
                                testimonial={testimonial}
                            />
                        )
                    )}
                </Marquee>
            </div>
        </div>
    );
}