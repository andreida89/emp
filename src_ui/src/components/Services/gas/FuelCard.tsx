import React from 'react';

type Props = {
  label: string;
  price: number;
  unit: string;
  className: string;
  active: boolean;
  onClick: () => void;
};

export default function FuelCard({ label, price, unit, className, active, onClick }: Props) {
  return (
    <div
      className={`gas-fuel-card ${className} ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="gas-fuel-header">{label}</div>
      <div className="gas-fuel-price">{price} RON / {unit}</div>
    </div>
  );
}
