"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { label: "Deployments", value: 10847, suffix: "+", prefix: "" },
  { label: "Uptime", value: 99.99, suffix: "%", prefix: "" },
  { label: "Latency (p99)", value: 12, suffix: "ms", prefix: "<" },
  { label: "Teams", value: 230, suffix: "+", prefix: "" },
];

function AnimatedCounter({
  value,
  suffix,
  prefix,
  inView,
}: {
  value: number;
  suffix: string;
  prefix: string;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const isFloat = value % 1 !== 0;
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = isFloat
        ? parseFloat((value * eased).toFixed(2))
        : Math.floor(value * eased);
      setCount(current);

      if (currentStep >= steps) {
        setCount(value);
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value, inView]);

  return (
    <span>
      {prefix}
      {typeof count === "number" && count % 1 !== 0
        ? count.toFixed(2)
        : count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function MetricsShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="metrics" ref={ref} className="relative py-24 px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(270,100%,64%,0.02)] to-transparent" />

      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Built for{" "}
            <span className="bg-gradient-to-r from-[hsl(142,71%,45%)] to-[hsl(170,80%,50%)] bg-clip-text text-transparent">
              enterprise scale
            </span>
          </h2>
          <p className="text-lg text-[hsl(215,20%,55%)] max-w-2xl mx-auto">
            Trusted by engineering teams running mission-critical
            infrastructure across Europe.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative group text-center p-8 rounded-xl bg-[hsl(224,71%,6%)] border border-[hsl(216,34%,17%)] hover:border-[hsl(210,100%,52%,0.3)] transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[hsl(210,100%,52%,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                    inView={inView}
                  />
                </div>
                <div className="text-sm text-[hsl(215,20%,50%)] font-medium">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
