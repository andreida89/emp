import React from 'react';
import images from 'utils/images';

type Props = {
  level: number;
};

export default function FuelBar({ level }: Props) {
  return (
    <div className="gas-fuel-bar">
      <span className="gas-fuel-icon">
        <img src={images.getImage('gas.svg')} alt="Fuel" draggable={false} />
      </span>
      <div className="gas-fuel-track">
        <div className="gas-fuel-fill" style={{ width: `${level}%` }}></div>
      </div>
      <span className="gas-fuel-percent">{level}%</span>
    </div>
  );
}
