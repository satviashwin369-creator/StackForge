"use client";

import { motion } from "framer-motion";
import { Camera, Mail, MapPin, Shield } from "lucide-react";
import type { UserProfile } from "@/lib/types/models";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProfileSettingsProps {
  user: UserProfile;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="text-sm">Profile</CardTitle>
          <CardDescription>
            Your public profile and account identity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <Avatar className="size-20">
                <AvatarFallback className="bg-primary/20 text-xl text-primary">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-muted"
                aria-label="Change avatar"
              >
                <Camera className="size-3.5" />
              </button>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="size-3.5" />
                {user.email}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {user.timezone}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Shield className="size-3.5" />
                MFA enabled · SSO via GitHub
              </p>
            </div>
          </div>

          <Separator />

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full name</Label>
                <Input id="profile-name" defaultValue={user.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" type="email" defaultValue={user.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-title">Job title</Label>
                <Input id="profile-title" defaultValue={user.jobTitle} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-company">Company</Label>
                <Input id="profile-company" defaultValue={user.company} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-bio">Bio</Label>
              <Textarea id="profile-bio" rows={3} defaultValue={user.bio} />
            </div>
            <Button size="sm">Save profile</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="text-sm">Account security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">
                Last changed 42 days ago
              </p>
            </div>
            <Button variant="outline" size="sm">
              Change password
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Two-factor authentication</p>
              <p className="text-xs text-muted-foreground">
                Authenticator app configured
              </p>
            </div>
            <Button variant="outline" size="sm">
              Manage 2FA
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
