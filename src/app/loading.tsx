import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream">
      <Spinner size={48} />
      <p className="text-sm font-semibold text-primary-dark">Apon Bazar</p>
    </div>
  );
}