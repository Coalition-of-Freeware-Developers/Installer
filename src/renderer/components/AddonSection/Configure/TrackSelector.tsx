import React from 'react';
import { useSelector } from 'react-redux';
import { InstallerStore } from 'renderer/redux/store';
import { Check } from 'tabler-icons-react';
import { Addon, AddonTrack } from 'renderer/utils/InstallerConfiguration';

import '../index.css';

export const Tracks: React.FC = ({ children }) => <div className="tracks-container">{children}</div>;

type TrackProps = {
  className?: string;
  addon: Addon;
  track: AddonTrack;
  isSelected: boolean;
  isInstalled: boolean;
  handleSelected(track: AddonTrack): void;
};

export const Track: React.FC<TrackProps> = ({ isSelected, isInstalled, handleSelected, addon, track }) => {
  const latestVersionName = useSelector<InstallerStore, string | undefined>(
    (state) => state.latestVersionNames[addon.key]?.[track.key]?.name
  );

  const trackClass = `track-item ${isSelected ? 'track-selected' : ''}`;

  return (
    <div className={trackClass} onClick={() => handleSelected(track)}>
      <div className="track-content">
        <span className="track-name">{track.name}</span>
        <span className="track-version">
          {latestVersionName ?? <span className="track-loading"></span>}
          {isInstalled && <Check className="track-check" strokeWidth={3} />}
        </span>
      </div>
    </div>
  );
};
