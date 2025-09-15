import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface/40">
      <div className="container flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-text-body/80">
          © {new Date().getFullYear()} Lux Starter. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm">
          
          <Link href="/terms" className="hover:text-text-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/40 rounded-md px-1">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}