"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  GitCommit,
  Settings2,
  UserPlus,
  Server,
} from "lucide-react";
import type { Activity } from "@/lib/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const activityIcons = {
  deployment: GitCommit,
  alert: AlertTriangle,
  config: Settings2,
  user: UserPlus,
  system: Server,
};

const activityColors = {
  deployment: "text-primary bg-primary/10",
  alert: "text-amber-400 bg-amber-500/10",
  config: "text-violet-400 bg-violet-500/10",
  user: "text-emerald-400 bg-emerald-500/10",
  system: "text-muted-foreground bg-muted",
};

interface ActivityFeedProps {
  activities: Activity[];
  limit?: number;
}

export function ActivityFeed({ activities, limit }: ActivityFeedProps) {
  const items = limit ? activities.slice(0, limit) : activities;

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((activity, i) => {
          const Icon = activityIcons[activity.type];
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  activityColors[activity.type]
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">{activity.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {activity.user} · {activity.timestamp}
                </p>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
