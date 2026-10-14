import { Wallet } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  showText?: boolean;
  iconOnly?: boolean;
}

export default function Logo({ className, showText = true, iconOnly = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-sm">
        <Wallet className="h-5 w-5 text-white" strokeWidth={2.5} />
      </div>
      {(showText || iconOnly === false) && showText && (
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Smart<span className="text-primary-600">Expense</span>
        </span>
      )}
    </div>
  );
}
