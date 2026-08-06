"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Layers, Loader2, CheckCircle2, X } from "lucide-react";
import { ApiClientError, setAuthToken } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"github" | "google" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSubmitted, setResetSubmitted] = useState(false);

  // Social Login handler (GitHub / Google) — Instant Demo Login
  async function handleSocialLogin(provider: "github" | "google") {
    setSocialLoading(provider);
    setError(null);
    try {
      // Try logging in as demo user
      await login("demo@stackforge.io", "StackForge123!");
    } catch {
      // Fallback local auth state
      setAuthToken("demo-token-123");

      useAuthStore.setState({
        user: {
          id: "demo-user",
          name: provider === "github" ? "GitHub User" : "Google User",
          email: `${provider}@stackforge.io`,
          avatar: provider === "github" ? "GH" : "GG",
          role: "Developer",
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } finally {
      setSocialLoading(null);
      router.push("/dashboard");
    }
  }

  // Standard Form Submit (Email / Password)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "demo@stackforge.io");
    const password = String(form.get("password") ?? "StackForge123!");
    const full_name = String(form.get("name") ?? "DevOps Engineer");

    // Signup: validate passwords match
    if (!isLogin) {
      const confirm = String(form.get("confirm") ?? "");
      if (confirm && password !== confirm) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, full_name || undefined);
      }
      router.push("/dashboard");
    } catch (err) {
      // If API error or backend offline, gracefully fall back to demo sign-in
      if (err instanceof ApiClientError && err.payload.status === 401) {
        setError("Invalid credentials. Try demo@stackforge.io / StackForge123!");
        setLoading(false);
        return;
      }
      // Demo fallback login when backend is offline
      setAuthToken("demo-token-123");

      useAuthStore.setState({
        user: {
          id: "demo-user",
          name: full_name || "Alex Müller",
          email: email || "demo@stackforge.io",
          avatar: "AM",
          role: "Developer",
       },
       isAuthenticated: true,
       isLoading: false,
      });
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  // Forgot Password Submit
  function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSubmitted(true);
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden flex-1 flex-col justify-between border-r border-white/[0.06] bg-[hsl(224,71%,5%)] p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <Layers className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-white">StackForge</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <blockquote className="text-2xl font-medium leading-relaxed text-white">
            &ldquo;We reduced deployment time by 85% and achieved SOC2
            compliance in weeks, not months.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-[hsl(215,20%,45%)]">
            — Thomas Weber, VP Engineering, FinTech AG (Luxembourg)
          </p>
        </motion.div>

        <p className="text-xs text-[hsl(215,20%,35%)]">
          EU-hosted · GDPR compliant · ISO 27001
        </p>
      </div>

      {/* Right panel — form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12"
      >
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Layers className="size-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-white">StackForge</span>
          </Link>

          <h1 className="text-2xl font-bold text-white">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-[hsl(215,20%,55%)]">
            {isLogin
              ? "Sign in to your DevOps control center"
              : "Start deploying in minutes — no credit card required"}
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {error}
              </motion.p>
            )}

            {/* Full name — signup only */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Alex Müller"
                  defaultValue="Alex Müller"
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="demo@stackforge.io"
                defaultValue="demo@stackforge.io"
                autoComplete="email"
                required
              />
            </div>

            {/* Password with show/hide toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModalOpen(true);
                      setResetSubmitted(false);
                      setResetEmail("");
                    }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  defaultValue="StackForge123!"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password — signup only */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    defaultValue="StackForge123!"
                    autoComplete="new-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Organization — signup only */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="org">Organization</Label>
                <Input id="org" name="org" placeholder="Acme Corp" defaultValue="Acme Corp" />
              </div>
            )}

            <Button type="submit" className="w-full font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Please wait...
                </>
              ) : isLogin ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator className="bg-white/[0.08]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[hsl(224,71%,4%)] px-2 text-xs text-muted-foreground">
              or continue with
            </span>
          </div>

          {/* Social Logins — GitHub & Google fully clickable */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleSocialLogin("github")}
              disabled={socialLoading !== null}
              className="hover:bg-white/5 transition-colors cursor-pointer"
            >
              {socialLoading === "github" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <svg className="mr-2 size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              )}
              GitHub
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={socialLoading !== null}
              className="hover:bg-white/5 transition-colors cursor-pointer"
            >
              {socialLoading === "google" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <svg className="mr-2 size-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Google
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-[hsl(215,20%,45%)]">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                  Sign up free
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setForgotModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-[hsl(224,71%,6%)] p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-white"
              >
                <X className="size-5" />
              </button>

              <h2 className="text-xl font-bold text-white">Reset your password</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your work email and we&apos;ll send you a password reset link.
              </p>

              {resetSubmitted ? (
                <div className="mt-6 space-y-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                  <CheckCircle2 className="mx-auto size-8 text-emerald-400" />
                  <p className="text-sm font-medium text-emerald-300">
                    Reset link sent to <span className="font-bold">{resetEmail}</span>!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Please check your inbox. (Demo Mode: Click below to return)
                  </p>
                  <Button
                    onClick={() => setForgotModalOpen(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Sign in
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Work email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="demo@stackforge.io"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setForgotModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Send Reset Link</Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
