import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from 'store';
import { SET_STAMINA } from 'store/player/types';

export default function Stamina() {
    const dispatch = useDispatch();
    const amount = useSelector((state: StoreState) => state.player.stamina);

    useEffect(() => {
        (window as any).UpdateStamina = (value: number) => {
            //console.log("[UI DEBUG] UpdateStamina apelat cu:", value);
            dispatch({ type: SET_STAMINA, payload: value });
        };

        (window as any).Player_SetStamina = (value: number) => {
            //console.log("[UI DEBUG] Player_SetStamina apelat cu:", value);
            dispatch({ type: SET_STAMINA, payload: value });
        };
    }, [dispatch]);

    useEffect(() => {
        //console.log("[UI DEBUG] Redux stamina a fost actualizata:", amount);
    }, [amount]);

    return (
        <div
            className="hud_stamina"
            style={{
                ['--p' as any]: amount
            }}
        >
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden>
                <circle
                    className="stamina-bg"
                    cx="50"
                    cy="50"
                    r="44"
                    pathLength="100"
                    fill="none"
                />
                <circle
                    className="stamina-progress"
                    cx="50"
                    cy="50"
                    r="44"
                    pathLength="100"
                    fill="none"
                />
            </svg>
            <i className="fa-solid fa-person-running" />
        </div>
    );
}
