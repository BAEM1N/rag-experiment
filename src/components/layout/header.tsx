import Image from 'next/image';
import Link from 'next/link';
import { Github } from 'lucide-react';

export function Header({ title = '삼성SDS RAG 입문' }: { title?: string }) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/favicon.ico" alt="SDS" width={28} height={28} />
          <span className="text-lg font-semibold">{title}</span>
        </Link>
        <a
          href="https://github.com/baem1n"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="h-5 w-5" />
        </a>
      </div>
    </header>
  );
}
