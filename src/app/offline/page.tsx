export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-bold text-neutral-900">You&apos;re offline</h1>
      <p className="max-w-sm text-sm text-neutral-500">
        This page hasn&apos;t been visited before, so it can&apos;t load without a
        connection. Recordings already in progress are unaffected — your
        shift keeps recording locally.
      </p>
    </main>
  );
}
