"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ProgressBar
        height="4px"
        color="#00f0ff"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
}
