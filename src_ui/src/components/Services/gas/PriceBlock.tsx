import React from 'react';

type Props = {
  value: number;
};

export default function PriceBlock({ value }: Props) {
  return (
    <div className="gas-price-block">
      <div className="gas-price-value">
        <span>PRET TOTAL:</span>
        <span>{value} RON</span>
      </div>
    </div>
  );
}
