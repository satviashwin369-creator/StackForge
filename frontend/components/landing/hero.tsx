"use client";

import React from "react";
import { motion } from "framer-motion";
import { Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";

const terminalLines = [
  { prompt: true, text: "stackforge deploy --env production" },
  { prompt: false, text: "⠋ Building project..." },
  { prompt: false, text: "✓ Build completed in 23s" },
  { prompt: false, text: "⠋ Running test suite..." },
  { prompt: false, text: "✓ 247 tests passed, 0 failed" },
  { prompt: false, text: "⠋ Scanning for vulnerabilities..." },
  { prompt: false, text: "✓ No vulnerabilities found" },
  { prompt: false, text: "⠋ Deploying to production..." },
  { prompt: false, text: "✓ Deployed to 3 regions (eu-west-1, us-east-1, ap-southeast-1)" },
  { prompt: false, text: '🚀 Live at https://api.stackforge.io — Uptime: 99.99%' },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated grid background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(210,100%,52%) 1px, transparent 1px), linear-gradient(90deg, hsl(210,100%,52%) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(210,100%,52%,0.08)_0%,_transparent_70%)]" />
        {/* Top glow orb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(210,100%,52%,0.06)] blur-[120px]"
        />
        {/* Secondary glow orb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(270,100%,64%,0.04)] blur-[100px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text content */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-sm font-medium rounded-full bg-[hsl(210,100%,52%,0.1)] text-[hsl(210,100%,60%)] border border-[hsl(210,100%,52%,0.2)]">
              <Rocket className="w-4 h-4" />
              Now in Public Beta
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
          >
            Deploy with{" "}
            <span className="bg-gradient-to-r from-[hsl(210,100%,60%)] via-[hsl(240,100%,70%)] to-[hsl(270,100%,64%)] bg-clip-text text-transparent">
              confidence
            </span>
            <br />
            <span className="text-[hsl(215,20%,65%)]">
              at any scale
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[hsl(215,20%,55%)] mb-10 max-w-lg mx-auto lg:mx-0"
          >
            The modern DevOps platform for engineering teams. Unified CI/CD
            pipelines, infrastructure monitoring, and log analytics — all in one
            powerful dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-[hsl(210,100%,52%)] to-[hsl(230,100%,60%)] text-white hover:from-[hsl(210,100%,56%)] hover:to-[hsl(230,100%,64%)] transition-all duration-300 shadow-[0_0_20px_hsl(210,100%,52%,0.3)] hover:shadow-[0_0_30px_hsl(210,100%,52%,0.4)]"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-lg border border-[hsl(216,34%,20%)] text-[hsl(215,20%,65%)] hover:text-white hover:border-[hsl(216,34%,30%)] hover:bg-[hsl(224,71%,8%)] transition-all duration-300"
            >
              View Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex items-center gap-8 justify-center lg:justify-start text-sm text-[hsl(215,20%,45%)]"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(142,71%,45%)]" />
              99.99% Uptime
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(210,100%,60%)]" />
              SOC2 Compliant
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(270,100%,64%)]" />
              EU Hosted
            </div>
          </motion.div>
        </div>

        {/* Right: Terminal animation */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:block"
        >
          <div className="relative">
            {/* Terminal glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[hsl(210,100%,52%,0.1)] to-[hsl(270,100%,64%,0.1)] rounded-2xl blur-xl" />
            
            <div className="relative rounded-xl border border-[hsl(216,34%,17%)] bg-[hsl(224,71%,4%)] overflow-hidden shadow-2xl">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(216,34%,17%)] bg-[hsl(224,71%,6%)]">
                <div className="w-3 h-3 rounded-full bg-[hsl(0,84%,60%)]" />
                <div className="w-3 h-3 rounded-full bg-[hsl(45,100%,51%)]" />
                <div className="w-3 h-3 rounded-full bg-[hsl(142,71%,45%)]" />
                <span className="ml-2 text-xs text-[hsl(215,20%,45%)] font-mono">
                  stackforge — deploy
                </span>
              </div>

              {/* Terminal body */}
              <div className="p-5 font-mono text-sm space-y-1.5 min-h-[340px]">
                {terminalLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.3, duration: 0.3 }}
                    className="flex items-start gap-2"
                  >
                    {line.prompt ? (
                      <>
                        <span className="text-[hsl(142,71%,45%)] shrink-0">
                          ❯
                        </span>
                        <span className="text-white">{line.text}</span>
                      </>
                    ) : (
                      <span
                        className={
                          line.text.startsWith("✓")
                            ? "text-[hsl(142,71%,55%)]"
                            : line.text.startsWith("🚀")
                            ? "text-[hsl(210,100%,70%)]"
                            : "text-[hsl(215,20%,55%)]"
                        }
                      >
                        {line.text}
                      </span>
                    )}
                  </motion.div>
                ))}
                {/* Blinking cursor */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 4.2 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-[hsl(142,71%,45%)]">❯</span>
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-2 h-5 bg-white"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
