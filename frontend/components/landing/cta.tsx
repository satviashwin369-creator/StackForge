"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(210,100%,52%,0.08)] via-[hsl(240,100%,60%,0.06)] to-[hsl(270,100%,64%,0.08)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(224,71%,4%)] via-transparent to-[hsl(224,71%,4%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to{" "}
          <span className="bg-gradient-to-r from-[hsl(210,100%,60%)] via-[hsl(240,100%,70%)] to-[hsl(270,100%,64%)] bg-clip-text text-transparent">
            supercharge
          </span>{" "}
          your DevOps?
        </h2>
        <p className="text-lg text-[hsl(215,20%,55%)] mb-10 max-w-xl mx-auto">
          Start deploying with confidence in minutes. No credit card required.
          Free for teams up to 5 developers.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold rounded-lg bg-gradient-to-r from-[hsl(210,100%,52%)] to-[hsl(230,100%,60%)] text-white hover:from-[hsl(210,100%,56%)] hover:to-[hsl(230,100%,64%)] transition-all duration-300 shadow-[0_0_30px_hsl(210,100%,52%,0.3)] hover:shadow-[0_0_40px_hsl(210,100%,52%,0.4)]"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold rounded-lg border border-[hsl(216,34%,20%)] text-[hsl(215,20%,65%)] hover:text-white hover:border-[hsl(216,34%,30%)] hover:bg-[hsl(224,71%,8%)] transition-all duration-300"
          >
            Explore Dashboard
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[hsl(215,20%,40%)]">
          <span>✓ No credit card required</span>
          <span>✓ 14-day free trial</span>
          <span>✓ EU data residency</span>
          <span>✓ SOC2 & GDPR compliant</span>
        </div>
      </motion.div>
    </section>
  );
}
