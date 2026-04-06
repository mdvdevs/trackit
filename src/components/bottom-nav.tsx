"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, UtensilsCrossed, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/food", label: "Food", icon: UtensilsCrossed },
  { href: "/me", label: "Me", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {tabs.map((tab) => {
          const isActive = 
            pathname.startsWith(tab.href) || 
            (tab.href === "/me" && (pathname.startsWith("/history") || pathname.startsWith("/progress")));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className={cn(isActive && "font-semibold")}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
