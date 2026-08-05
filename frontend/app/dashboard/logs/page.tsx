"use client";



import { DashboardLayout } from "@/components/layout/dashboard-layout";

import { LogViewer } from "@/components/dashboard/log-viewer";

import { ErrorState } from "@/components/dashboard/error-state";

import { ChartSkeleton } from "@/components/dashboard/dashboard-skeletons";

import { useLiveLogs } from "@/hooks/use-live-logs";

import { useAsyncData } from "@/hooks/use-async-data";

import { logsService } from "@/lib/api/services";



export default function LogsPage() {

  const { logs, loading, error, live, refetch } = useLiveLogs({

    pollIntervalMs: 4000,

  });

  const services = useAsyncData(() => logsService.getServices());



  if (error) {

    return (

      <DashboardLayout title="Logs" description="Live log stream">

        <ErrorState message={error} onRetry={refetch} />

      </DashboardLayout>

    );

  }



  return (

    <DashboardLayout

      title="Logs"

      description={

        live

          ? "Live log stream (WebSocket connected)"

          : "Real-time log stream across all services"

      }

    >

      {loading && logs.length === 0 ? (

        <ChartSkeleton tall />

      ) : (

        <LogViewer

          logs={logs}

          services={services.data ?? undefined}

        />

      )}

    </DashboardLayout>

  );

}


