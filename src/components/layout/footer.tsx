export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} 배움 AI</p>
      </div>
    </footer>
  );
}
