import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from 'store';
import { SET_ARMORVALUE } from 'store/player/types';

export default function Armura() {
  const dispatch = useDispatch();
  const amount = useSelector((state: StoreState) => state.player.armorValue);

  useEffect(() => {
    (window as any).UpdateArmor = (value: number) =>
      dispatch({ type: SET_ARMORVALUE, payload: value });

    (window as any).Player_SetArmura = (value: number) =>
      dispatch({ type: SET_ARMORVALUE, payload: value });
  }, [dispatch]);

  return (
    <div
      className="hud_armura"
      style={
        { 
          // doar progresul, nu dimensiunea
          // --p va fi 0..100; nu se fac calcule JS de mărime
          ['--p' as any]: amount 
        }
      }
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden>
        {/* fundal */}
        <circle
          className="armura-bg"
          cx="50"
          cy="50"
          r="44"
          pathLength="100"
          fill="none"
        />
        {/* progres */}
        <circle
          className="armura-progress"
          cx="50"
          cy="50"
          r="44"
          pathLength="100"
          fill="none"
        />
      </svg>
      <i className="fa-solid fa-shield" />
    </div>
  );
}
