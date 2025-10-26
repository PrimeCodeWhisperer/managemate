export default function ReadyPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-semibold">Everything is ready!</h1>
      <p className="text-muted-foreground">
        Your account has been set up successfully. You can now log in to the app with your credentials.
      </p>

      <p className="text-xs text-muted-foreground">
        Sign in with the credentials you just created to get started.
      </p>
    </div>
  );
}