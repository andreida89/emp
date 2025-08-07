import React, { Component } from 'react';
import rpc from 'utils/rpc';
import classNames from 'classnames';
import Fuel from './fuel';

type Props = {
    binds: {
        [name: string]: string;
    };
};

type State = typeof initialState;

const initialState = {
    inVehicle: false,
    engine: {
        health: 100,
        active: false
    },
    velocity: 0,
    rpm: 0,
    fuel: {
        current: 0,
        max: 100
    },
    odometer: 0,
    locked: false,
    seatbelt: false,
    cruise: false,
    lights: false
};

function StatusIcons({ locked, seatbelt, engine, lights }: any) {
    const getIconClass = (active: boolean) =>
        "indicator-icon " + (active ? "indicator-active" : "indicator-inactive");
    return (
        <div id="status-icons">
            <svg id="indicator-lock" className={getIconClass(locked)} xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <svg id="indicator-seatbelt" className={getIconClass(seatbelt)} xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m8 14.5 9-9" />
            </svg>
            <svg id="indicator-lights" className={getIconClass(lights)} xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <svg id="indicator-engine" className={getIconClass(engine)} xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M4.877 8.123A2 2 0 016.877 6H17.123a2 2 0 011.999 2.123L18.124 16.123A2 2 0 0116.123 18H7.877a2 2 0 01-1.999-1.877L4.877 8.123z" />
            </svg>
        </div>
    );
}

export default class Speedometer extends Component<Props, State> {
    readonly state: State = initialState;

    componentDidMount() {
        rpc.register('Speedometer-UpdateState', (state: State) => this.setState(() => state));
    }

    componentWillUnmount() {
        rpc.unregister('Speedometer-UpdateState');
    }

    render() {
        const {
            inVehicle,
            engine,
            velocity,
            fuel,
            odometer,
            locked,
            seatbelt,
            lights
        } = this.state;

        if (!inVehicle) return null;

        // Format velocity as "085"
        const speedStr = Math.floor(velocity).toString().padStart(3, '0');
        const fuelPercent = (fuel.current * 100) / fuel.max;

        return (
            <div id="speedometer-ui">
                <div className="speedometer-grid">
                    {/* KM/H label */}
                    <div id="kmh-unit">KM/H</div>

                    {/* Speed Display */}
                    <div id="speed-display">
                        <span className="speed-digit-gray">{speedStr[0]}</span>
                        <span className="speed-digit-white">{speedStr.slice(1)}</span>
                    </div>

                    {/* Fuel gauge */}
                    <Fuel amount={fuelPercent} />

                    {/* Odometer & status icons */}
                    <div id="indicators-container">
                        <div id="odometer">{Math.floor(odometer).toLocaleString('en-US')} KM</div>
                        <StatusIcons
                            locked={locked}
                            seatbelt={seatbelt}
                            engine={engine.active}
                            lights={lights}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
