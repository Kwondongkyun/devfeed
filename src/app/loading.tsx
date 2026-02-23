import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader className="h-8 w-8 animate-spin text-orange" />
        <p className="font-mono text-xs text-muted-foreground">loading...</p>
      </div>
    </div>
  );
}
