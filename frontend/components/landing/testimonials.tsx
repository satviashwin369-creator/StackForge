"use client";

import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "StackForge transformed our deployment workflow. We went from 2-hour release cycles to 15 minutes with full confidence.",
    name: "Thomas Weber",
    title: "VP of Engineering, FinTech AG",
    avatar: "TW",
  },
  {
    quote:
      "The infrastructure monitoring is best-in-class. We caught a critical memory leak before it impacted any customers.",
    name: "Sophie Laurent",
    title: "SRE Lead, CloudScale EU",
    avatar: "SL",
  },
  {
    quote:
      "Finally, a DevOps platform that doesn't require a PhD to configure. The team was productive within the first hour.",
    name: "Marcus Eriksson",
    title: "CTO, NordTech Solutions",
    avatar: "ME",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(224,71%,4%)] to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-[hsl(270,100%,64%,0.1)] text-[hsl(270,100%,70%)] border border-[hsl(270,100%,64%,0.2)]">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Loved by engineering teams
          </h2>
          <p className="text-lg text-[hsl(215,20%,55%)] max-w-2xl mx-auto">
            Trusted by DevOps teams across Europe&apos;s leading tech companies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative group p-6 rounded-xl bg-[hsl(224,71%,6%)] border border-[hsl(216,34%,17%)] hover:border-[hsl(270,100%,64%,0.3)] transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[hsl(270,100%,64%,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg
                      key={j}
                      className="w-4 h-4 text-[hsl(45,100%,51%)]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-[hsl(215,20%,70%)] text-sm leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(210,100%,52%)] to-[hsl(270,100%,64%)] flex items-center justify-center text-white text-xs font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-[hsl(215,20%,45%)]">
                      {testimonial.title}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
