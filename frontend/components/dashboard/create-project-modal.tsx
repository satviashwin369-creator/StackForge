"use client";



import { useState } from "react";

import { Plus } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import {

  Dialog,

  DialogContent,

  DialogDescription,

  DialogFooter,

  DialogHeader,

  DialogTitle,

  DialogTrigger,

} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "@/components/ui/select";

import { projectsService } from "@/lib/api/services";

import { ApiClientError } from "@/lib/api-client";



interface CreateProjectModalProps {

  onCreated?: () => void;

}



export function CreateProjectModal({ onCreated }: CreateProjectModalProps) {

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [framework, setFramework] = useState("Next.js");



  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();

    setError(null);

    setLoading(true);

    const form = new FormData(e.currentTarget);

    const name = String(form.get("name") ?? "");

    const repo = String(form.get("repo") ?? "");

    const description = String(form.get("desc") ?? "");



    try {

      await projectsService.create({

        name,

        description: description || undefined,

        framework,

        repo,

        branch: "main",

        status: "active",

      });

      setOpen(false);

      onCreated?.();

      e.currentTarget.reset();

    } catch (err) {

      setError(

        err instanceof ApiClientError ? err.message : "Failed to create project"

      );

    } finally {

      setLoading(false);

    }

  }



  return (

    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger

        className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}

      >

        <Plus className="size-4" />

        New project

      </DialogTrigger>

      <DialogContent className="sm:max-w-md">

        <DialogHeader>

          <DialogTitle>Create project</DialogTitle>

          <DialogDescription>

            Connect a repository and configure your deployment pipeline.

          </DialogDescription>

        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>

          {error && (

            <p className="text-xs text-destructive">{error}</p>

          )}

          <div className="space-y-2">

            <Label htmlFor="name">Project name</Label>

            <Input id="name" name="name" placeholder="my-service" required />

          </div>

          <div className="space-y-2">

            <Label htmlFor="repo">Repository URL</Label>

            <Input

              id="repo"

              name="repo"

              placeholder="github.com/org/repo"

              className="font-mono text-xs"

              required

            />

          </div>

          <div className="space-y-2">

            <Label>Framework</Label>

            <Select
              value={framework}
              onValueChange={(v) => v && setFramework(v)}
            >

              <SelectTrigger>

                <SelectValue />

              </SelectTrigger>

              <SelectContent>

                <SelectItem value="Next.js">Next.js</SelectItem>

                <SelectItem value="Node.js">Node.js</SelectItem>

                <SelectItem value="Go">Go</SelectItem>

                <SelectItem value="Python">Python</SelectItem>

                <SelectItem value="Rust">Rust</SelectItem>

              </SelectContent>

            </Select>

          </div>

          <div className="space-y-2">

            <Label htmlFor="desc">Description</Label>

            <Textarea

              id="desc"

              name="desc"

              placeholder="What does this service do?"

              rows={3}

            />

          </div>

          <DialogFooter>

            <Button

              type="button"

              variant="outline"

              onClick={() => setOpen(false)}

            >

              Cancel

            </Button>

            <Button type="submit" disabled={loading}>

              {loading ? "Creating…" : "Create project"}

            </Button>

          </DialogFooter>

        </form>

      </DialogContent>

    </Dialog>

  );

}


