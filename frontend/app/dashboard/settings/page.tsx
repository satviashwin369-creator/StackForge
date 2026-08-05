"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { ErrorState } from "@/components/dashboard/error-state";
import { ChartSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hydrate = useAuthStore((s) => s.hydrate);

  if (isLoading) {
    return (
      <DashboardLayout title="Settings" description="Loading profile…">
        <ChartSkeleton tall />
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout title="Settings" description="Profile unavailable">
        <ErrorState message="Could not load profile" onRetry={() => void hydrate()} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Settings"
      description="Profile, appearance, team, and platform configuration"
    >
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="general">Organization</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings user={user} />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="general">
          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>
                Workspace name and billing region (EU)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization name</Label>
                <Input id="org-name" defaultValue="StackForge EU" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Data region</Label>
                <Input id="region" defaultValue="eu-central-1" disabled />
              </div>
              <Button>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Team members</CardTitle>
              <CardDescription>
                Team management will be available in a future release.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You are signed in as {user.email}. Invite flows connect to the
                backend when the team API is enabled.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Alerts for deployments and infrastructure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Deployment succeeded",
                "Deployment failed",
                "Infrastructure alert",
              ].map((label) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-sm">{label}</span>
                  <Switch defaultChecked />
                </div>
              ))}
              <Separator />
              <Button>Save preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>API access</CardTitle>
              <CardDescription>
                Use your JWT from login for authenticated API calls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-mono text-xs text-muted-foreground">
                Authorization: Bearer &lt;token&gt;
              </p>
              <p className="text-sm text-muted-foreground">
                Base URL: {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
