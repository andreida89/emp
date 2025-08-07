import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from 'store';
import { SET_HEALTH } from 'store/player/types';

export default function Viata() {
  const dispatch = useDispatch();
  const amount = useSelector((state: StoreState) => state.player.health);

  useEffect(() => {
    (window as any).UpdateHealth = (value: number) =>
      dispatch({ type: SET_HEALTH, payload: value });

    (window as any).Player_SetViata = (value: number) =>
      dispatch({ type: SET_HEALTH, payload: value });
  }, [dispatch]);

  return (
    <div
      className="hud_viata"
      style={{ ['--p' as any]: Math.min(Math.max(amount, 0), 100) }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <circle className="viata-bg" cx="50" cy="50" r="44" pathLength="100" fill="none" />
        <circle className="viata-progress" cx="50" cy="50" r="44" pathLength="100" fill="none" />
      </svg>
      <i className="fa-solid fa-heart" />
    </div>
  );
}
