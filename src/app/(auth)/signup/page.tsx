"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but login failed. Please try logging in.");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl text-white mb-2">
            Create your account
          </h1>
          <p className="text-[#8888a0]">
            Access all courses on DeepCurriculum
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/20 rounded-lg p-3 text-[#ff6b6b] text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#c8c6c3]">
              Display Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="bg-[#12121a] border-[#2a2a3e] text-white placeholder:text-[#555] focus:border-[#6c5ce7] focus:ring-[#6c5ce7]"
            />
          </div>

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
              placeholder="Min. 8 characters"
              required
              minLength={8}
              className="bg-[#12121a] border-[#2a2a3e] text-white placeholder:text-[#555] focus:border-[#6c5ce7] focus:ring-[#6c5ce7]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6c5ce7] hover:bg-[#5b4bd6] text-white font-medium py-2.5"
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center mt-6 text-[#8888a0] text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#a29bfe] hover:text-[#6c5ce7] underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
