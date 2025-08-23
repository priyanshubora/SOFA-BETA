import { Ship } from 'lucide-react';
import { cn } from '@/lib/utils';
import './ocean-background.css';

export function OceanBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-blue-100 to-blue-300 dark:from-slate-800 dark:to-slate-950", className)}>
        <div className="ocean">
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
        </div>
    </div>
  );
}
