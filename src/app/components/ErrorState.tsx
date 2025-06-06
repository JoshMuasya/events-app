import { ErrorStateProps } from "@/lib/types";

export default function ErrorState({ error, errorSource = "Unknown", errorDetails }: ErrorStateProps) {
  return (
    <div className="container mx-auto p-6 text-center" role="alert">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Error Occurred</h2>
        <p className="text-lg">
          <strong>Message:</strong> {error || "Event not found"}
        </p>
        <p className="text-md mt-2">
          <strong>Source:</strong> {errorSource}
        </p>
        {errorDetails && (
          <p className="text-sm mt-2">
            <strong>Details:</strong> {errorDetails}
          </p>
        )}
      </div>
    </div>
  );
}