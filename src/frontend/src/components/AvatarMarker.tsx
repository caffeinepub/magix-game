import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AvatarMarkerProps {
  displayName?: string;
  principal: string;
  x: number;
  y: number;
}

export function AvatarMarker({ displayName, principal, x, y }: AvatarMarkerProps) {
  const getInitials = (name?: string) => {
    if (name && name.length > 0) {
      return name.slice(0, 2).toUpperCase();
    }
    return principal.slice(0, 2).toUpperCase();
  };

  const getColor = (principal: string) => {
    const colors = [
      'bg-rose-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-lime-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-indigo-500',
      'bg-violet-500',
    ];
    const hash = principal.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="flex flex-col items-center gap-1">
        <Avatar className={`w-10 h-10 border-2 border-white dark:border-slate-800 shadow-lg ${getColor(principal)}`}>
          <AvatarFallback className="text-white font-bold text-sm">{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        {displayName && (
          <span className="text-xs font-medium px-2 py-0.5 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-sm whitespace-nowrap">
            {displayName}
          </span>
        )}
      </div>
    </div>
  );
}
