import React from 'react';
import rpc from 'utils/rpc';

type Props = {
  onPay: () => void;
  onJerrycan: () => void;
  onClose: () => void;
  jerrycanPrice?: number; // ✅ adăugat
};

export default function ActionButtons({ onPay, onJerrycan, onClose, jerrycanPrice }: Props) {
  return (
    <div className="gas-btns">
      <button className="gas-btn gas-btn--white" onClick={onPay}>
        PLATESTE
      </button>

      {jerrycanPrice! > 0 && (
        <button className="gas-btn gas-btn--white" onClick={onJerrycan}>
          UMPLE CANISTRA ({jerrycanPrice} RON)
        </button>
      )}

      <button className="gas-btn" onClick={() => rpc.callClient('Gas-CloseMenu')}>
        INCHIDE
      </button>
    </div>
  );
}
