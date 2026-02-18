"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/auth";

type AuthGuardProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [router, token]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Checking session...
      </div>
    );
  }

  return <>{children}</>;
}
