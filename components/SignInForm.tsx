"use client";

import { signInSchema } from "@/schemas/signInSchema";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function SignInForm() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { isSignedIn, signOut } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authErr, setAuthErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    setAuthErr(null);

    try {
      if (isSignedIn) await signOut();

      await signIn?.create({
        identifier: data.identifier,
        password: data.password,
      });

      if (signIn?.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) =>
            router.push(decorateUrl("/dashboard")),
        });
      } else {
        setAuthErr("Invalid credentials");
      }
    } catch (err: any) {
      const code = err?.errors?.[0]?.code;

      if (code === "form_identifier_not_found") {
        setAuthErr("No account found with this email");
      } else if (code === "form_password_incorrect") {
        setAuthErr("Incorrect password");
      } else {
        setAuthErr("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#05050A] text-white overflow-hidden">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-black to-fuchsia-900/20" />

        <div className="relative z-10 max-w-md space-y-6">
          <div className="flex items-center gap-2 text-violet-300">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest">
              Secure Cloud Storage
            </span>
          </div>

          <h1 className="text-5xl font-bold leading-tight">
            Welcome
            <br />
            Back to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              Droply
            </span>
          </h1>

          <p className="text-zinc-400 text-sm leading-relaxed">
            Access your files anywhere with ultra-secure, lightning-fast
            cloud storage designed for modern workflows.
          </p>

          <div className="h-[1px] w-full bg-white/10" />

          <p className="text-xs text-zinc-500">
            Trusted by developers, creators & startups worldwide.
          </p>
        </div>

        {/* glow blobs */}
        <div className="absolute w-[400px] h-[400px] bg-violet-600/20 blur-3xl rounded-full top-10 left-10" />
        <div className="absolute w-[300px] h-[300px] bg-fuchsia-600/20 blur-3xl rounded-full bottom-10 right-10" />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-10 text-center">
            <Link href="/">
              <h1 className="text-3xl font-bold tracking-tight">
                drop<span className="text-violet-400">ly</span>
              </h1>
            </Link>
            <p className="text-zinc-500 text-sm mt-1">
              Sign in to continue
            </p>
          </div>

          {/* FORM CARD */}
          <div className="relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_60px_-15px_rgba(139,92,246,0.25)]">

            {/* glow border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-xl" />

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="relative space-y-5"
            >
              {/* EMAIL */}
              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-400">
                  Email
                </label>

                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    {...register("identifier")}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-violet-500 outline-none transition"
                  />
                </div>

                {errors.identifier && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-400">
                  Password
                </label>

                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    {...register("password")}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-violet-500 outline-none transition"
                  />
                </div>

                {errors.password && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* ERROR */}
              {authErr && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  {authErr}
                </div>
              )}

              {/* BUTTON */}
              <button
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* FOOTER */}
              <div className="text-center text-sm text-zinc-500 pt-2">
                New here?{" "}
                <Link
                  href="/sign-up"
                  className="text-violet-400 hover:text-fuchsia-400"
                >
                  Create account
                </Link>
              </div>
            </form>
          </div>

          <p className="text-xs text-zinc-600 text-center mt-6">
            By continuing you agree to our Terms & Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}