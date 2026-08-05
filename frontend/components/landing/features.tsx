"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  GitBranch,
  Activity,
  BarChart3,
  Cloud,
  Users,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: GitBranch,
    title: "CI/CD Pipelines",
    description:
      "Automated build, test, and deploy workflows with real-time pipeline visualization and rollback capabilities.",
  },
  {
    icon: Activity,
    title: "Infrastructure Monitoring",
    description:
      "Real-time server health monitoring with CPU, RAM, and disk usage tracking across all your environments.",
  },
  {
    icon: BarChart3,
    title: "Log Analytics",
    description:
      "Terminal-style log viewer with intelligent filtering, pattern detection, and real-time streaming.",
  },
  {
    icon: Cloud,
    title: "Multi-Cloud",
    description:
      "Deploy to AWS, GCP, Azure, or any custom infrastructure. Unified interface for all your cloud providers.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Role-based access control, audit logs, and team-wide notifications for seamless DevOps collaboration.",
  },
  {
    icon: Shield,
    title: "Security First",
    description:
      "Automated vulnerability scanning, secrets management, and compliance reporting built into every pipeline.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Features() {
  return (
    <section id="features" className="relative py-24 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(210,100%,52%,0.02)] to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-[hsl(210,100%,52%,0.1)] text-[hsl(210,100%,60%)] border border-[hsl(210,100%,52%,0.2)]">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-[hsl(210,100%,60%)] to-[hsl(270,100%,64%)] bg-clip-text text-transparent">
              ship faster
            </span>
          </h2>
          <p className="text-lg text-[hsl(215,20%,55%)] max-w-2xl mx-auto">
            A complete DevOps control center designed for teams that demand
            reliability, speed, and visibility.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative p-6 rounded-xl bg-[hsl(224,71%,6%)] border border-[hsl(216,34%,17%)] hover:border-[hsl(210,100%,52%,0.3)] transition-all duration-300"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[hsl(210,100%,52%,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="w-12 h-12 mb-4 rounded-lg bg-[hsl(210,100%,52%,0.1)] flex items-center justify-center group-hover:bg-[hsl(210,100%,52%,0.15)] transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-[hsl(210,100%,60%)]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[hsl(215,20%,55%)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
