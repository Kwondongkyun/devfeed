import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[560px] rounded-[16px] border border-border bg-card p-10 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-elevated p-4">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <h1 className="mb-2 font-sans text-6xl font-bold text-orange">404</h1>

        <p className="mb-2 font-sans text-xl font-semibold text-foreground">
          PAGE_NOT_FOUND
        </p>

        <p className="mb-8 font-mono text-sm text-muted-foreground">
          // the_page_you_are_looking_for_does_not_exist
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-[16px] bg-orange px-6 py-3 font-mono text-sm font-semibold text-text-dark transition-colors hover:bg-orange/90"
        >
          <Home className="h-4 w-4" />
          go_home
        </Link>
      </div>
    </div>
  );
}
