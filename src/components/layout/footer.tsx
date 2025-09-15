export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface/40">
      <div className="container flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-text-body/80">
          © {new Date().getFullYear()} Lux Starter. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm">
          <span className="hover:text-text-hi rounded-md px-1">Terms</span>
          <span className="hover:text-text-hi rounded-md px-1">Privacy</span>
        </div>
      </div>
    </footer>
  );
}