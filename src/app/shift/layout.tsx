import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ShiftLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
