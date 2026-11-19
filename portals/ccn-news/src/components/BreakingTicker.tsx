import { useHeadlineRotation } from '../lib/useHeadlineRotation';
interface Props { badgeText?: string; items?: string[]; onSelectHeadline?: (text: string) => void }
export function BreakingTicker({ badgeText = 'AKTUALNOŚCI', items = [], onSelectHeadline }: Props) {
  const rotation = useHeadlineRotation(items.length);
  if (!items.length) return null;
  return <section aria-label="Aktualne nagłówki" {...rotation.handlers} className="bg-zinc-950 text-white px-3 sm:px-4 py-1 border-b border-zinc-800 max-w-full overflow-hidden">
    <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 flex-nowrap min-w-0">
      <span className="text-[10px] sm:text-xs font-extrabold tracking-wider px-2 py-0.5 rounded bg-[#bb142e] text-white shrink-0 uppercase">{badgeText}</span>
      <button type="button" className="text-left text-xs sm:text-sm font-medium leading-snug flex-1 min-w-0 truncate min-h-[40px] sm:min-h-[44px] flex items-center text-zinc-100 hover:text-white transition-colors cursor-pointer" onClick={() => onSelectHeadline?.(items[rotation.index])}>{items[rotation.index]}</button>
      {items.length > 1 && <div className="flex items-center gap-0.5 sm:gap-1 text-xs shrink-0 text-zinc-300">
        <button type="button" className="w-8 h-10 sm:min-w-[44px] sm:min-h-[44px] inline-flex items-center justify-center rounded hover:bg-zinc-800 cursor-pointer" aria-label="Poprzedni nagłówek" onClick={rotation.previous}>←</button>
        <span className="text-[11px] sm:text-xs tabular-nums px-0.5 text-zinc-400">{rotation.index + 1}/{items.length}</span>
        <button type="button" className="w-8 h-10 sm:min-w-[44px] sm:min-h-[44px] inline-flex items-center justify-center rounded hover:bg-zinc-800 cursor-pointer" aria-label="Następny nagłówek" onClick={rotation.next}>→</button>
        <button type="button" className="hidden sm:inline-flex min-w-[44px] min-h-[44px] items-center justify-center px-2 rounded hover:bg-zinc-800 cursor-pointer" onClick={rotation.toggle} aria-label={rotation.paused ? 'Wznów nagłówki' : 'Wstrzymaj nagłówki'}>{rotation.paused ? 'Wznów' : 'Pauza'}</button>
      </div>}
    </div>
  </section>;
}
