import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import rpc from 'utils/rpc';

export default function Mic({ bind }: { bind: string }) {
  const [status, setStatus] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(2); // 1: whisper, 2: normal, 3: shout

  useEffect(() => {
    rpc.register('HUD-SetMicStatus', setStatus);
    rpc.register('HUD-SetVoiceLevel', setVoiceLevel);

    return () => {
      rpc.unregister('HUD-SetMicStatus');
      rpc.unregister('HUD-SetVoiceLevel');
    };
  }, []);

  // transformăm voiceLevel în procent din cerc
  // whisper ≈ 33%, normal ≈ 66%, shout = 100%
  const progressPercent = (voiceLevel / 3) * 100;

  return (
    <div
      className={classNames('hud_mic', { active: status })}
      style={{ ['--p' as any]: progressPercent }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <circle className="mic-bg" cx="50" cy="50" r="44" pathLength="100" fill="none" />
        <circle className="mic-progress" cx="50" cy="50" r="44" pathLength="100" fill="none" />
      </svg>
      <i className="fa-solid fa-microphone" />
    </div>
  );
}
