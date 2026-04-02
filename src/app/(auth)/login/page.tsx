"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/20 rounded-lg p-3 text-[#ff6b6b] text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#c8c6c3]">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.edu"
          required
          className="bg-[#12121a] border-[#2a2a3e] text-white placeholder:text-[#555] focus:border-[#6c5ce7] focus:ring-[#6c5ce7]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#c8c6c3]">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          className="bg-[#12121a] border-[#2a2a3e] text-white placeholder:text-[#555] focus:border-[#6c5ce7] focus:ring-[#6c5ce7]"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#6c5ce7] hover:bg-[#5b4bd6] text-white font-medium py-2.5"
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl text-white mb-2">
            Welcome back
          </h1>
          <p className="text-[#8888a0]">Sign in to continue your coursework</p>
        </div>

        <Suspense fallback={<div className="h-64" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center mt-6 text-[#8888a0] text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-[#a29bfe] hover:text-[#6c5ce7] underline underline-offset-2"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
