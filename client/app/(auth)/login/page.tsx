export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 text-center">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Login</h3>
          <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
        </div>
        {/* Form will go here */}
        <div className="p-4 text-center text-sm text-yellow-600 bg-yellow-50 rounded">
          Auth Form Placeholder
        </div>
      </div>
    </div>
  );
}
