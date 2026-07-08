export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Vendor City</h1>
        <p className="text-sm text-muted-foreground">
          Vendor compliance &amp; performance management
        </p>
      </div>
      {children}
    </div>
  );
}
