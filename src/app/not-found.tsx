export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <h1 className="text-2xl font-semibold text-neutral-900">404 - Page Not Found</h1>
      <p className="mt-2 text-neutral-600">The page you are looking for does not exist.</p>
      <a href="/" className="mt-4" style={{ color: '#1e3a5f' }}>Return to home</a>
    </main>
  );
}
