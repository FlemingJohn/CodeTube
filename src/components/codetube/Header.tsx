import { Clapperboard } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Clapperboard className="w-8 h-8 text-primary" />
      <h1 className="text-2xl font-bold font-headline">CodeTube</h1>
    </Link>
  );
}
