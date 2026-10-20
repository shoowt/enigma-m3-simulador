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
    <div className="flex items-center gap-1.5 p-1 bg-[#141518] border border-[#2b2e35] rounded-xl overflow-x-auto max-w-full">
      {STATIONS.map((st) => {
        const isCurrent = st.id === currentStationId;
        return (
          <button
            key={st.id}
            onClick={() => onSelectStation(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              isCurrent
                ? 'bg-[#22252c] text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c20]'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: st.color, boxShadow: isCurrent ? `0 0 6px ${st.color}` : 'none' }}
            ></span>
            <span>{st.name}</span>
          </button>
        );
      })}
    </div>
  );
};
