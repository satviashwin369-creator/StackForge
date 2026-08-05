"use client";

import { motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/components/providers/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const themes: {
  value: Theme;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    value: "dark",
    label: "Dark",
    description: "Default enterprise theme",
    icon: Moon,
  },
  {
    value: "light",
    label: "Light",
    description: "High-contrast daytime mode",
    icon: Sun,
  },
  {
    value: "system",
    label: "System",
    description: "Match OS preference",
    icon: Monitor,
  },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="text-sm">Appearance</CardTitle>
          <CardDescription>
            Customize how StackForge looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {themes.map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all",
                  theme === value
                    ? "border-primary bg-primary/5 shadow-[0_0_20px_-8px] shadow-primary/30"
                    : "border-border/60 bg-card hover:border-primary/30"
                )}
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    theme === value ? "bg-primary/15 text-primary" : "bg-muted"
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
