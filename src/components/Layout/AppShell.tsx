import type { ReactNode } from "react";
import { BackgroundGrid } from "./BackgroundGrid";
import { Header } from "./Header";

interface AppShellProps {
  children: ReactNode;
  footer?: ReactNode;
}

export function AppShell({ children, footer }: AppShellProps) {
  return (
    <div className="relative min-h-screen">
      <BackgroundGrid />
      <Header />
      <main className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>
      {footer}
    </div>
  );
}
