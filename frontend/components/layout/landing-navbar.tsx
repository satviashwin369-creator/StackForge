"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "#features", label: "Features" },
  { href: "#metrics", label: "Platform" },
  { href: "#testimonials", label: "Customers" },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-[hsl(224,71%,4%)]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(210,100%,52%)] to-[hsl(270,100%,64%)]">
            <Layers className="size-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">StackForge</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[hsl(215,20%,55%)] transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="inline-flex h-8 items-center rounded-lg px-2.5 text-sm text-[hsl(215,20%,65%)] hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get started
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      <div
        className={cn(
          "border-t border-white/[0.06] bg-[hsl(224,71%,4%)] md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-[hsl(215,20%,65%)] hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm text-[hsl(215,20%,65%)]"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="mt-2 rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
          >
            Get started
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
