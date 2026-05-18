import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import rpc from 'utils/rpc';

// --- ASSETS ---
const FISH_IMG = "https://empirerp.ro/resurse/fish.png";
const GOLDFISH_IMG = "https://empirerp.ro/resurse/goldfish.png";
const TEXTURE_IMG = "https://empirerp.ro/resurse/texture.png";

// --- UTILS ---
const getRandomDuration = (min: number, max: number) => min + Math.random() * (max - min);

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
};

const RARITY_CONFIG: Record<string, { color: string; price: number }> = {
  COMMON: { color: '#71717a', price: 50 },
  UNCOMMON: { color: '#16a34a', price: 150 },
  RARE: { color: '#2563eb', price: 500 },
  EPIC: { color: '#9333ea', price: 1200 },
  LEGENDARY: { color: '#f97316', price: 5000 },
};

const getRandomRarity = () => {
  const roll = Math.random();
  if (roll < 0.6) return 'COMMON';
  if (roll < 0.8) return 'UNCOMMON';
  if (roll < 0.93) return 'RARE';
  if (roll < 0.98) return 'EPIC';
  return 'LEGENDARY';
};

// --- CSS REZOLVAT PENTRU RESPONSIVENESS (VH/VW/%) ---
const FishermanStyles = () => (
  <style>{`
    .f-game-app { height: 100vh; width: 100%; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 10vh; font-family: sans-serif; user-select: none; position: relative; }
    
    .f-game-fish-bar-container { position: relative; display: flex; width: 100%; align-items: center; justify-content: center; padding-top: 12vh; padding-bottom: 1vh; }
    .f-game-bar-edge { height: 5.5vh; width: 1.2vw; background-color: #F5D327; box-shadow: 0 0 1.5vw rgba(255,59,59,0.3); z-index: 40; }
    .f-game-texture-box { height: 5.5vh; width: 16vw; position: relative; overflow: hidden; background-color: #18181b; box-shadow: inset 0 0 1vw rgba(0,0,0,0.5); display: flex; align-items: center; background-image: url(${TEXTURE_IMG}); background-size: cover; background-position: center; }
    .f-game-texture-overlay { position: absolute; inset: 0; background-color: rgba(0, 0, 0, 0.6); border-top: 0.1vh solid rgba(255,255,255,0.05); border-bottom: 0.1vh solid rgba(255,255,255,0.05); }
    
    .f-game-needle-container { position: absolute; z-index: 30; width: 7vw; aspect-ratio: 139/143; top: -6.5vh; pointer-events: none; }
    .f-game-goldfish-img { position: absolute; top: 20%; transform: translateY(-50%); width: 6.5vh; z-index: 10; filter: brightness(1.1) drop-shadow(0 0 0.8vh rgba(255,215,0,0.4)); pointer-events: none; }
    
    .f-game-instruction-text { font-size: 0.8vw; font-weight: bold; text-transform: uppercase; font-style: italic; color: #fff; letter-spacing: 0.1vw; margin-top: 2vh; text-shadow: 0 0.2vh 0.4vh rgba(0,0,0,0.8); }
    .f-game-enter-key { margin: 0 0.4vw; display: inline-block; transform: rotate(8deg); background-color: #fff; padding: 0.1vh 0.4vw; font-weight: 900; color: #000; font-style: normal; box-shadow: 0 0.4vh 0.8vh rgba(0,0,0,0.3); }
    
    .f-game-reward-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5vh; background-color: rgba(10, 10, 10, 0.95); border: 0.1vh solid rgba(255,255,255,0.05); border-radius: 3vh; box-shadow: 0 0 8vh rgba(0,0,0,0.8); z-index: 50; }
    .f-game-fish-display-box { position: relative; margin-bottom: 2vh; padding: 2vh; border-radius: 2vh; overflow: hidden; border: 0.1vh solid rgba(255,255,255,0.1); width: 18vw; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background-image: url(${TEXTURE_IMG}); background-size: cover; }
    .f-game-display-overlay { position: absolute; inset: 0; background-color: rgba(0,0,0,0.6); }
    .f-game-display-content { position: relative; z-index: 10; display: flex; flex-direction: column; height: 100%; width: 100%; justify-content: center; align-items: center; }
    .f-game-caught-fish-img { width: 12vw; object-fit: contain; filter: drop-shadow(0 1.5vh 3vh rgba(0,0,0,0.8)); }
    
    .f-game-reward-title { font-size: 1.6vw; font-weight: 900; font-style: italic; color: #f59e0b; text-transform: uppercase; letter-spacing: -0.05vw; margin-bottom: 2vh; filter: drop-shadow(0 0.2vh 0.4vh rgba(0,0,0,0.5)); }
    .f-game-reward-subtitle { font-size: 0.7vw; font-weight: bold; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.3vw; margin-bottom: 0.5vh; }
    .f-game-price-container { display: flex; align-items: center; gap: 0.8vw; }
    .f-game-price-value { font-size: 2.6vw; font-weight: 900; font-style: italic; color: #fff; line-height: 1; }
    .f-game-continue-btn { margin-top: 4vh; padding: 1.2vh 3.5vw; background-color: #fff; color: #000; font-weight: 900; font-style: italic; font-size: 0.85vw; border-radius: 0.5vh; text-transform: uppercase; transition: all 0.2s; box-shadow: 0 1vh 2vh rgba(0,0,0,0.3); border: none; cursor: pointer; }
    .f-game-continue-btn:hover { background-color: #fbbf24; transform: scale(1.05); }
    .f-game-continue-btn:active { transform: scale(0.95); }
  `}</style>
);

// --- COMPONENTS ---

const Needle = (props: any) => (
    <svg
      {...props}
      viewBox="0 0 139 143"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M62.5446 44.3331C61.6878 39.6767 61.361 36.2633 61.6413 33.7145L82.1579 33.5655C82.1817 34.3624 82.0968 35.3759 81.9289 36.8409C80.6772 48.2776 76.5666 56.5428 71.7797 57.4237C69.3588 57.8692 67.7605 56.9118 65.6674 53.8839C64.0361 51.5105 63.6584 50.3854 62.5446 44.3331Z"
        fill="#F8F8F8"
      />
      <path
        d="M69.7166 1.3046C69.5232 3.23131 69.632 17.355 69.8395 17.5894C70.1011 17.8919 75.0988 17.8229 75.2615 17.5062C75.4983 17.173 75.4966 1.78309 75.2636 1.43411C74.9341 0.826017 69.7829 0.728765 69.7166 1.3046Z"
        fill="#F8F8F8"
      />
      <path
        d="M66.927 22.7482C65.4293 23.5229 63.9747 24.8786 63.0495 26.37C62.1243 27.8613 61.3965 29.8348 61.7152 30.0015C61.8277 30.0556 66.3851 30.1028 71.8416 30.093C77.2982 30.0832 81.8836 30.0827 82.0288 30.1083C82.2537 30.1349 82.2111 29.8801 81.8632 28.9452C80.5698 25.2837 77.5916 22.6058 74.0262 21.8263C71.5102 21.2794 69.1032 21.583 66.927 22.7482Z"
        fill="#F8F8F8"
      />
      <path
        d="M71.1213 44.1424C70.4314 44.4254 70.0127 44.7792 69.6707 45.3689C69.4348 45.7876 69.364 46.1532 69.364 47.0023C69.364 48.789 69.765 51.018 70.3783 52.6514C70.4785 52.9168 70.5434 53.1703 70.5257 53.2116C70.5139 53.2529 70.3606 53.3354 70.1955 53.3944C69.5174 53.6303 69.3287 54.3851 69.824 54.904C70.166 55.2696 70.2486 55.2637 72.1827 54.8863C73.9635 54.5384 74.052 54.5089 74.3055 54.1374C74.4235 53.9723 74.4412 53.8838 74.4235 53.6244C74.3881 53.247 74.2525 53.0406 73.9104 52.8637C73.7689 52.7929 73.6392 52.7222 73.6274 52.7045C73.6097 52.6927 73.6687 52.4686 73.7571 52.2151C74.0166 51.4308 74.2466 50.4991 74.4117 49.5143C74.5473 48.6947 74.5709 48.394 74.5768 47.2441L74.5827 45.9173L74.394 45.5281C74.164 45.0564 73.6569 44.5257 73.2323 44.3134C72.5483 43.9655 71.711 43.9006 71.1213 44.1424ZM72.3596 46.2122C72.6132 46.3242 72.8254 46.507 72.9375 46.7252C73.1262 47.0908 72.9906 48.4647 72.6662 49.4259C72.5306 49.8328 72.0883 50.6642 72.0058 50.6642C71.935 50.6642 71.593 50.0981 71.4338 49.7266C71.2333 49.2549 71.1449 48.9247 71.0446 48.335C70.8323 47.0554 70.9798 46.4893 71.6048 46.2181C71.8702 46.1001 72.0883 46.1001 72.3596 46.2122Z"
        fill="#F8F8F8"
      />
      <path
        d="M72.8726 55.1743C72.6485 55.2214 71.935 55.363 71.2923 55.4868C70.0598 55.7286 69.9183 55.7816 69.6766 56.1472C69.423 56.5187 69.5704 57.1379 69.9714 57.3915C70.1306 57.4917 70.225 57.5035 70.6318 57.4799C70.8913 57.4622 71.2923 57.415 71.5163 57.3679C71.7463 57.3207 72.224 57.2263 72.5778 57.1556C73.5684 56.9551 73.9045 56.8666 74.0637 56.7664C74.4352 56.5187 74.5532 55.9291 74.3055 55.5576C74.0048 55.1153 73.6392 55.021 72.8726 55.1743Z"
        fill="#F8F8F8"
      />
      <path
        d="M72.165 57.6598C71.6166 57.7719 70.9384 57.9016 70.6613 57.9547C70.0598 58.0726 69.8122 58.2082 69.6589 58.5149C69.3345 59.1399 69.765 59.8652 70.4608 59.8652C70.5964 59.8652 71.1684 59.7768 71.7286 59.6647C72.2947 59.5527 72.9964 59.4171 73.2854 59.364C73.8986 59.2461 74.1935 59.081 74.335 58.7861C74.5414 58.3616 74.3881 57.8073 74.0048 57.5714C73.7217 57.4004 73.3738 57.4181 72.165 57.6598Z"
        fill="#F8F8F8"
      />
      <path
        d="M73.3148 59.7843C73.2323 59.7961 72.9846 59.8433 72.7546 59.8845C72.5306 59.9317 72.1178 60.0143 71.8406 60.0614C69.9891 60.4153 69.8947 60.4447 69.6765 60.8398C69.4407 61.2526 69.5232 61.689 69.8888 62.0015C70.1719 62.2374 70.4254 62.2491 71.4043 62.0487C71.8878 61.9543 72.6426 61.8069 73.079 61.7243C73.9222 61.5651 74.0755 61.4885 74.3055 61.1523C74.565 60.775 74.388 60.1086 73.9753 59.8963C73.7807 59.802 73.5153 59.7548 73.3148 59.7843Z"
        fill="#F8F8F8"
      />
      <path
        d="M73.02 62.1673C72.4775 62.2793 72.1414 62.3442 71.1389 62.5447C70.4785 62.6685 70.0598 62.7806 69.9596 62.8513C69.5586 63.1521 69.4407 63.6179 69.653 64.0366C69.8063 64.3314 69.9832 64.4552 70.3842 64.5496L70.6908 64.6204V69.2434C70.6849 73.4242 70.679 73.9254 70.5787 74.4562C70.2014 76.5554 69.4053 78.1121 68.0137 79.4566C67.023 80.406 65.9262 81.0664 64.5876 81.5028C63.6383 81.8153 63.1017 81.9156 62.3528 81.9156C61.1734 81.9156 60.2771 81.7151 59.3867 81.261C59.0034 81.0664 58.7852 80.8954 58.396 80.5003C57.5351 79.6276 57.1636 78.8139 56.9159 77.2866C56.739 76.2134 56.9395 73.2473 57.1813 73.2473C57.2226 73.2473 57.3523 73.4065 57.482 73.5952C57.7179 73.9667 58.0481 74.2439 58.3901 74.3559C58.8088 74.4974 59.9292 74.3972 59.9292 74.2144C59.9292 74.1731 59.8348 73.9726 59.7169 73.7662C58.7793 72.1269 58.1955 69.839 58.0717 67.38C58.054 66.9555 58.0245 66.4778 58.0127 66.3186C57.9951 66.1535 58.0127 65.5167 58.0422 64.9034C58.0953 63.9186 58.1307 63.5236 58.2545 62.6331L58.284 62.4268L58.172 62.5624C57.8358 62.9928 56.6624 65.098 56.3617 65.8174C56.3027 65.9648 56.2083 66.1889 56.1494 66.3186C55.312 68.2587 54.628 70.7117 54.2447 73.1294C54.1975 73.436 54.1268 73.8901 54.0796 74.1318C53.9735 74.751 53.9735 77.6758 54.0796 78.2301C54.2329 79.0085 54.3921 79.6158 54.5631 80.0817C55.4418 82.4757 57.199 84.0089 59.8113 84.6634C61.3267 85.0467 62.7891 84.9878 64.7174 84.4806C68.0137 83.6138 70.5139 81.5676 71.994 78.5131C72.678 77.1038 73.132 75.4881 73.2559 74.0316C73.2854 73.6483 73.3148 71.2483 73.3148 68.695V64.0543L73.6333 63.9599C74.1876 63.8007 74.4352 63.5118 74.4352 63.0282C74.4352 62.7452 74.2819 62.4621 74.0107 62.2616C73.8279 62.126 73.4033 62.0847 73.02 62.1673Z"
        fill="#F8F8F8"
      />
    </svg>
);

const FishBar = forwardRef(({ onCatch }: { onCatch: (success: boolean) => void }, ref) => {
  const fishControls = useAnimation();
  const needleControls = useAnimation();
  const needleFloatControls = useAnimation();

  const textureBoxRef = useRef<HTMLDivElement>(null);
  const fishRef = useRef<HTMLImageElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);

  const isChecking = useRef(false);

  useEffect(() => {
    let active = true;

    const startAnimations = async () => {
      await new Promise(r => setTimeout(r, 200));
      
      const moveFish = async () => {
        while (active) {
          const barWidth = textureBoxRef.current?.offsetWidth || 0;
          if (barWidth > 0) {
            const fishWidth = barWidth * 0.22; 
            await fishControls.start({
              x: barWidth - fishWidth,
              transition: { duration: getRandomDuration(1.5, 2.5), ease: "linear" }
            });
            if (!active) break;
            await fishControls.start({
              x: 0,
              transition: { duration: getRandomDuration(1.5, 2.5), ease: "linear" }
            });
          } else {
            await new Promise(r => setTimeout(r, 100));
          }
        }
      };

      const moveNeedle = async () => {
        while (active) {
          const barWidth = textureBoxRef.current?.offsetWidth || 0;
          if (barWidth > 0) {
            await needleControls.start({
              x: barWidth * 0.35,
              transition: { duration: 0.8, ease: "linear" }
            });
            if (!active) break;
            await needleControls.start({
              x: -barWidth * 0.35,
              transition: { duration: 0.8, ease: "linear" }
            });
          } else {
            await new Promise(r => setTimeout(r, 100));
          }
        }
      };

      moveFish();
      moveNeedle();
      
      needleFloatControls.start({
        y: [0, -6, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      });
    };

    startAnimations();

    return () => {
      active = false;
      fishControls.stop();
      needleControls.stop();
      needleFloatControls.stop();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    triggerCatch: () => {
      if (isChecking.current) return;
      isChecking.current = true;

      if (!needleRef.current || !fishRef.current) return;

      const needleRect = needleRef.current.getBoundingClientRect();
      const fishRect = fishRef.current.getBoundingClientRect();

      // Detecție bazată pe axa X (mijlocul acului să fie pe suprafața peștelui)
      const needleCenter = needleRect.left + needleRect.width / 2;
      const isHit = needleCenter >= fishRect.left && needleCenter <= fishRect.right;

      onCatch(isHit);
      
      setTimeout(() => {
        isChecking.current = false;
      }, 800);
    }
  }));

  return (
    <div className="f-game-fish-bar-container">
      <div className="f-game-bar-edge"></div>
      
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={needleControls}
          className="f-game-needle-container"
          ref={needleRef}
        >
          <motion.div animate={needleFloatControls} style={{ width: '100%', height: '100%' }}>
            <Needle />
          </motion.div>
        </motion.div>

        <div ref={textureBoxRef} className="f-game-texture-box">
          <div className="f-game-texture-overlay"></div>
          
          <motion.img
            animate={fishControls}
            className="f-game-goldfish-img"
            src={GOLDFISH_IMG}
            alt="goldfish"
            ref={fishRef}
            initial={{ x: 0 }}
          />
        </div>
      </div>

      <div className="f-game-bar-edge"></div>
    </div>
  );
});

const FishInfo = ({ name, id, price, onDone }: { name: string, id: string, price: number, onDone: () => void }) => {
  const [money, setMoney] = useState(0);
  const fishImage = require(`assets/images/inventory/${id}.png`);

  useEffect(() => {
    const targetMoney = price;
    const startTime = performance.now();
    const duration = 1000;

    const animateMoney = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setMoney(Math.floor(progress * targetMoney));
      if (progress < 1) requestAnimationFrame(animateMoney);
    };
    requestAnimationFrame(animateMoney);
  }, [price]);

  return (
    <div className="f-game-reward-panel">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="f-game-fish-display-box"
      >
        <div className="f-game-display-overlay"></div>
        <div className="f-game-display-content">
          <img src={fishImage} alt={name} className="f-game-caught-fish-img" />
        </div>
      </motion.div>

      <h1 className="f-game-reward-title" style={{ color: '#f59e0b', fontSize: '1.8vw', fontWeight: 900, textTransform: 'uppercase', marginBottom: '2vh' }}>{name}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5vh' }}>
        <h2 className="f-game-reward-subtitle">VINDE-L ÎN SHOP PENTRU</h2>
        <div className="f-game-price-container" style={{ display: 'flex', alignItems: 'center', gap: '0.6vw' }}>
          <span className="f-game-price-value">{formatMoney(money)}</span>

          <span style={{ color: '#22c55e', fontWeight: 700 }}>
            RON
          </span>
        </div>
      </div>

      <motion.button
        onClick={onDone}
        className="f-game-continue-btn"
      >
        CONTINUĂ
      </motion.button>
    </div>
  );
};

export default function FishingMinigame(props: any) {
  const { fishInfoJson, text, durationSec } = (props.location && props.location.state) || {};
  const [gameState, setGameState] = useState('fishing');
  const [fishData, setFishData] = useState<{ name: string; id: string; price: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fishBarRef = useRef<{ triggerCatch: () => void }>(null);

  useEffect(() => {
    const focusTimer = setInterval(() => {
      if (gameState === 'fishing') {
        containerRef.current?.focus();
      }
    }, 100);
    return () => clearInterval(focusTimer);
  }, [gameState]);

  const handleCatch = (success: boolean) => {
    if (success) {
      if (fishInfoJson) {
        try {
          const info = JSON.parse(fishInfoJson);
          setFishData({ name: info.name, price: info.price, id: info.id });
          setGameState('caught');
        } catch (e) {
          rpc.callClient('Fishing-Drop');
        }
      } else {
        setFishData({ name: "Pește Misterios", price: 100, id: "oblete" });
        setGameState('caught');
      }
    } else {
        rpc.callClient('Fishing-Drop');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameState === 'fishing') {
      fishBarRef.current?.triggerCatch();
    }
  };

  const handleDone = () => {
    rpc.callClient('Fishing-Success', JSON.stringify(fishData));
  }

  return (
    <div
      ref={containerRef}
      className="f-game-app"
      onKeyDown={handleKeyPress}
      tabIndex={0}
      onClick={() => containerRef.current?.focus()}
    >
      <FishermanStyles />

      <AnimatePresence exitBeforeEnter>
        {gameState === 'fishing' ? (
          <motion.div 
            key="game-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FishBar ref={fishBarRef} onCatch={handleCatch} />
              
              <h1 className="f-game-instruction-text">
                APASĂ TASTA <span className="f-game-enter-key">ENTER</span> PENTRU A PRINDE PEȘTELE
              </h1>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reward-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            {fishData && (
              <FishInfo
                {...fishData}
                onDone={handleDone}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
