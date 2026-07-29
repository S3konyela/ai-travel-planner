export function Footer() {
  return (
    <footer className="mt-auto border-t border-black/5 py-8 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-tripora-navy/60 dark:text-white/50 sm:flex-row">
        <span>
          Trip<span className="tripora-gradient-text font-semibold">ora</span> — Travel Smarter
        </span>
        <span>© {new Date().getFullYear()} Tripora. All rights reserved.</span>
      </div>
    </footer>
  );
}
