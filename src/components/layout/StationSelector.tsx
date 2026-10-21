import type { Station } from '../../types/crypto';
import { STATIONS } from '../../core/keySheet';

interface StationSelectorProps {
  currentStationId: string;
  onSelectStation: (station: Station) => void;
}

export const StationSelector: React.FC<StationSelectorProps> = ({
  currentStationId,
  onSelectStation
}) => {
  return (
    <div className="flex items-center gap-1 p-0.5 bg-[#121316] border border-[#22252c] rounded-lg overflow-x-auto max-w-full">
      {STATIONS.map((st) => {
        const isCurrent = st.id === currentStationId;
        return (
          <button
            key={st.id}
            onClick={() => onSelectStation(st)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              isCurrent
                ? 'bg-[#1e2027] text-amber-300 border border-amber-500/35 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#16171b]'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: st.color, boxShadow: isCurrent ? `0 0 5px ${st.color}` : 'none' }}
            ></span>
            <span>{st.name}</span>
          </button>
        );
      })}
    </div>
  );
};
