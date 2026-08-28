"use client";

import React from "react";
import { AssessmentProvider } from "@/src/context/AssessmentContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AssessmentProvider>{children}</AssessmentProvider>;
}
