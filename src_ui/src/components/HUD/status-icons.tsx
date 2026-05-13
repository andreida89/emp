import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from 'store';
import { SET_HEALTH, SET_ARMORVALUE, SET_STAMINA } from 'store/player/types';

/**
 * Componenta WaveFill: Gestionează animația lichidului.
 */
const WaveFill = ({ percentage, color, darkColor }: { percentage: number, color: string, darkColor: string }) => {
  if (percentage >= 100) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: color,
        borderRadius: '0.2vh',
        pointerEvents: 'none',
        zIndex: 1
      }} />
    );
  }

  const topPosition = 62 - (percentage * 1.12);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      borderRadius: '0.2vh',
      pointerEvents: 'none',
      zIndex: 1
    }}>
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none" 
        style={{
          position: 'absolute',
          width: '400%',
          height: '150%',
          top: 0,
          left: 0,
          overflow: 'visible',
          transition: 'transform 200ms linear',
          transform: `translateY(${topPosition}%)`
        }}
      >
        <g className="status-icons-animate-wave-slow" style={{ opacity: 0.4 }}>
          <path d="M0 25 C 20 5, 30 45, 50 25 C 70 5, 80 45, 100 25 V 150 H 0 Z" fill={darkColor} />
          <path d="M100 25 C 120 5, 130 45, 150 25 C 170 5, 180 45, 200 25 V 150 H 100 Z" fill={darkColor} />
        </g>
        <g className="status-icons-animate-wave-fast">
          <path d="M0 30 C 20 50, 30 10, 50 30 C 70 50, 80 10, 100 30 V 150 H 0 Z" fill={color} />
          <path d="M100 30 C 120 50, 130 10, 150 30 C 170 50, 180 10, 200 30 V 150 H 100 Z" fill={color} />
        </g>
      </svg>
    </div>
  );
};

/**
 * Componenta HUDItem: Indicator individual cu dimensiuni pixel-perfecte.
 */
const HUDItem = ({ iconPath, percentage, color, darkColor, bgColor }: any) => {
  return (
    <div style={{
      width: '4.2vh',
      minWidth: '4.2vh',
      maxWidth: '4.2vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flex: '0 0 4.2vh'
    }}>
      {/* Caseta pătrată responsivă */}
      <div style={{
        position: 'relative',
        width: '3.5vh',
        height: '3.5vh',
        minWidth: '3.5vh',
        maxWidth: '3.5vh',
        minHeight: '3.5vh',
        maxHeight: '3.5vh',
        backgroundColor: bgColor,
        borderRadius: '0.2vh',
        overflow: 'hidden',
        boxShadow: '0 0.1vh 0.2vh rgba(0,0,0,0.6)',
        flex: '0 0 3.5vh'
      }}>
        <WaveFill percentage={percentage} color={color} darkColor={darkColor} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1))',
          zIndex: 5,
          borderRadius: '0.2vh',
          pointerEvents: 'none'
        }} />
        <div style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1.8vh',
          height: '1.8vh',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <svg 
            viewBox="0 0 24 24" 
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', height: '100%', display: 'block' }}
            fill="white"
          >
            <path d={iconPath} />
          </svg>
        </div>
      </div>
      {/* Textul procentual */}
      <div style={{ 
        width: '100%',
        marginTop: '0.2vh',
        textAlign: 'center',
        flex: '0 0 auto'
      }}>
        <span style={{ 
          fontFamily: 'monospace',
          fontWeight: 900,
          fontSize: '1vh',
          fontVariantNumeric: 'tabular-nums',
          color: 'white',
          textShadow: '0 0.1vh 0.1vh black',
          display: 'block',
          width: '100%',
          whiteSpace: 'nowrap'
        }}>
          {Math.floor(percentage)}%
        </span>
      </div>
    </div>
  );
};

export default function StatusIcons({ showHealthArmor, showFoodWater, showStamina }: { showHealthArmor: boolean, showFoodWater: boolean, showStamina: boolean }) {
  const dispatch = useDispatch();
  
  const health = useSelector((state: StoreState) => state.player.health);
  const armor = useSelector((state: StoreState) => state.player.armorValue);
  const food = useSelector((state: StoreState) => state.player.satiety);
  const water = useSelector((state: StoreState) => state.player.thirst);
  const stamina = useSelector((state: StoreState) => state.player.stamina);

  useEffect(() => {
    (window as any).UpdateHealth = (value: number) => dispatch({ type: SET_HEALTH, payload: value });
    (window as any).Player_SetViata = (value: number) => dispatch({ type: SET_HEALTH, payload: value });
    
    (window as any).UpdateArmor = (value: number) => dispatch({ type: SET_ARMORVALUE, payload: value });
    (window as any).Player_SetArmura = (value: number) => dispatch({ type: SET_ARMORVALUE, payload: value });
    
    (window as any).UpdateStamina = (value: number) => dispatch({ type: SET_STAMINA, payload: value });
    (window as any).Player_SetStamina = (value: number) => dispatch({ type: SET_STAMINA, payload: value });
  }, [dispatch]);

  const icons = {
    heart: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    shield: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
    food: "M3 11h18c.6 0 1 .4 1 1v1c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1v-1c0-.6.4-1 1-1zm16-2c0-3.3-2.7-6-7-6S5 5.7 5 9h14zm-14 6c0 3.3 2.7 6 7 6s7-2.7 7-6H5z",
    water: "M12 21.5c-3.5 0-6.4-2.8-6.4-6.4 0-3.6 6.4-11.1 6.4-11.1s6.4 7.5 6.4 11.1c0 3.6-2.9 6.4-6.4 6.4z",
    stamina: "M13 2v9h6L11 22v-9H5l8-11z"
  };

  const statConfig = [
    { id: 'health', percentage: Math.max(0, Math.min(100, health)), color: '#ff2d55', darkColor: '#961b32', bgColor: 'rgba(42, 8, 14, 0.75)', icon: icons.heart, show: showHealthArmor },
    { id: 'armor', percentage: Math.max(0, Math.min(100, armor)), color: '#40B9FF', darkColor: '#2b84ba', bgColor: 'rgba(30, 74, 122, 0.75)', icon: icons.shield, show: showHealthArmor && armor > 0 },
    { id: 'food', percentage: Math.max(0, Math.min(100, food)), color: '#ffb347', darkColor: '#9c6d2b', bgColor: 'rgba(26, 19, 8, 0.75)', icon: icons.food, show: showFoodWater },
    { id: 'water', percentage: Math.max(0, Math.min(100, water)), color: '#06b6d4', darkColor: '#0891b2', bgColor: 'rgba(22, 78, 99, 0.75)', icon: icons.water, show: showFoodWater },
    { id: 'stamina', percentage: Math.max(0, Math.min(100, stamina)), color: '#22c55e', darkColor: '#166534', bgColor: 'rgba(6, 26, 11, 0.75)', icon: icons.stamina, show: showStamina && stamina < 100 }
  ];

  const visibleStats = statConfig.filter(stat => stat.show);

  if (visibleStats.length === 0) return null;

  return (
    <>
      <div style={{ 
        position: 'absolute',
        bottom: '1%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', 
        flexDirection: 'row',
        gap: '0.4vh',
        justifyContent: 'center',
        padding: '0.5vh',
        zIndex: 100
      }}>
        {visibleStats.map((stat) => (
          <HUDItem 
            key={stat.id} 
            {...stat} 
            iconPath={stat.icon} 
          />
        ))}
      </div>

      <style>{`
        @keyframes status-icons-move-wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .status-icons-animate-wave-fast { animation: status-icons-move-wave 7s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite; }
        .status-icons-animate-wave-slow { animation: status-icons-move-wave 12s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite reverse; }
      `}</style>
    </>
  );
}
