import { Clapperboard } from 'lucide-react';

export default function Header() {
  return (
    <div className="flex items-center gap-2">
      <Clapperboard className="w-8 h-8 text-primary" />
      <h1 className="text-2xl font-bold font-headline text-white">CodeTube</h1>
    </div>
  );
}
