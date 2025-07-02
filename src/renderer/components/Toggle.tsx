import React, { FC } from 'react';
import './Toggle.css';

interface ToggleProps {
  value: boolean;
  onToggle: (value: boolean) => void;
  scale?: number;
  bgColor?: string;
  onColor?: string;
}

export const Toggle: FC<ToggleProps> = ({
  value,
  onToggle,
  scale = 1,
  bgColor = 'bg-navy-light',
  onColor = 'bg-cyan-medium',
}) => (
  <div
    className={`toggle-container ${bgColor}`}
    onClick={() => onToggle(!value)}
    style={{ transform: `scale(${scale})` }}
  >
    <div
      className={`toggle-thumb ${value ? onColor : 'bg-gray-400'}`}
      style={{ transform: `translate(${value ? '12px' : '1px'}, 0)` }}
    />
  </div>
);
