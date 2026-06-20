"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";

const navLinks = [
  { label: "Search Flights", href: "/" },
  { label: "My Bookings", href: "#" },
] as const;

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="FlyNext"
              width={120}
              height={36}
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors",
                  pathname === link.href
                    ? "text-primary-500 font-medium"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="md:hidden relative flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span
              className={cn(
                "block h-0.5 w-5 bg-gray-700 rounded-full transition-all duration-300",
                mobileMenuOpen && "translate-y-1.25 rotate-45",
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 bg-gray-700 rounded-full mt-1 transition-all duration-300",
                mobileMenuOpen && "opacity-0",
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 bg-gray-700 rounded-full mt-1 transition-all duration-300",
                mobileMenuOpen && "-translate-y-1.25 -rotate-45",
              )}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-100",
          mobileMenuOpen
            ? "max-h-60 opacity-100"
            : "max-h-0 opacity-0 border-t-0",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === link.href
                  ? "text-primary-500 font-medium bg-primary-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
