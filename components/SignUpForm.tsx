"use client";

import { motion } from "framer-motion";
import { signUpSchema } from "@/schemas/signUpSchema";
import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authErr, SetauthErr] = useState<null | string>(null);
  const [verificationErr, setVerificationErr] = useState<null | string>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const { signUp } = useSignUp();

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { isSignedIn } = useAuth();

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    SetauthErr(null);
    try {
      if (isSignedIn) {
        SetauthErr("You are already logged in. Please logout first.");
        setIsSubmitting(false);
      }

      const { error }: any = await signUp.password({
        emailAddress: data.email,
        password: data.password,
      });

      if (error) {
        const err = error.errors?.[0];

        if (err?.code === "form_password_pwned") {
          SetauthErr("Weak or compromised password.");
          return;
        }
        if (err?.code === "form_identifier_exists") {
          SetauthErr("User already exists.");
          return;
        }

        SetauthErr(err?.message || "Signup failed");
        return;
      }

      await signUp.verifications.sendEmailCode();
      setVerifying(true);
    } catch {
      SetauthErr("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationCode = async () => {
    if (!signUp) return;

    setIsSubmitting(true);
    setVerificationErr(null);

    try {
      await signUp.verifications.verifyEmailCode({
        code: verificationCode,
      });

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ decorateUrl }) => {
            router.push(decorateUrl("/dashboard"));
          },
        });
      } else {
        setVerificationErr("Verification incomplete.");
      }
    } catch (error: any) {
      setVerificationErr(error.errors?.[0]?.message || "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= VERIFICATION UI ================= */

  if (verifying) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-[#0A0A0F] via-[#0F0A1F] to-[#12001F] text-white">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-2">Verify Email</h2>
            <p className="text-white/60 mb-6">Enter OTP sent to your email</p>

            <input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter code"
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:border-purple-500 outline-none"
            />

            {verificationErr && (
              <p className="text-red-400 text-sm mt-3">{verificationErr}</p>
            )}

            <button
              onClick={handleVerificationCode}
              disabled={isSubmitting}
              className="w-full mt-5 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition"
            >
              {isSubmitting ? "Verifying..." : "Verify"}
            </button>
          </motion.div>
        </div>

        <div className="hidden lg:flex w-1/2 items-center justify-center">
          <h1 className="text-6xl font-bold">
            drop<span className="text-purple-500">ly</span>
          </h1>
        </div>
      </div>
    );
  }

  /* ================= SIGNUP UI ================= */

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#07070C] via-[#120A1F] to-[#1A0B2E] text-white">
      {/* LEFT FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
        >
          <h2 className="text-3xl font-bold mb-1">Create Account</h2>
          <p className="text-white/60 mb-6">Join Droply today</p>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:border-purple-500 outline-none"
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email.message}</p>
            )}

            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:border-purple-500 outline-none"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              {...register("confirmPassword")}
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:border-purple-500 outline-none"
            />
          </div>

          {authErr && (
            <p className="text-red-400 text-sm mt-4">{authErr}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition"
          >
            {isSubmitting ? "Creating..." : "Sign Up"}
          </button>

          <p className="text-sm text-white/60 mt-4 text-center">
            Already have account?{" "}
            <Link href="/sign-in" className="text-purple-400">
              Sign in
            </Link>
          </p>
        </motion.form>
      </div>

      {/* RIGHT SIDE BRAND */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#6d28d9_0%,_transparent_60%)] opacity-30" />

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-7xl font-extrabold"
        >
          drop<span className="text-purple-500">ly</span>
        </motion.h1>
      </div>
    </div>
  );
}