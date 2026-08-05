import Link from "next/link";
import { Layers } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[hsl(224,71%,4%)] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <Layers className="size-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-white">StackForge</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-[hsl(215,20%,45%)]">
              Enterprise DevOps platform. Built for EU engineering teams.
              Luxembourg · Frankfurt · Dublin
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 text-sm">
            <div>
              <p className="font-medium text-white">Product</p>
              <ul className="mt-3 space-y-2 text-[hsl(215,20%,45%)]">
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <a href="#features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-white">Company</p>
              <ul className="mt-3 space-y-2 text-[hsl(215,20%,45%)]">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-white">Legal</p>
              <ul className="mt-3 space-y-2 text-[hsl(215,20%,45%)]">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    SOC2
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-white/[0.06] pt-8 text-center text-xs text-[hsl(215,20%,35%)]">
          © {new Date().getFullYear()} StackForge SAS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
