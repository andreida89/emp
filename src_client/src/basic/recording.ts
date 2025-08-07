let recording = false;

// Pornește înregistrarea
function startRecording() {
  mp.game.graphics.notify('Editor ~y~Recording started~n~~w~Press ~g~F9 ~w~to save or ~r~F10 ~w~to discard');
  recording = true;

  if (!mp.game.recording.isRecording()) {
    mp.game.recording.start(1); // 1 = start new recording
  }
}

// Salvează înregistrarea
function saveRecording() {
  if (mp.game.recording.isRecording()) {
    mp.game.recording.start(0); // 0 = resume if paused
    mp.game.recording.stopAndSaveClip();
    mp.game.graphics.notify('Editor ~g~Recording saved');
  } else {
    mp.game.graphics.notify('~r~Not recording!');
  }

  recording = false;
}

// Anulează înregistrarea
function discardRecording() {
  if (mp.game.recording.isRecording()) {
    mp.game.recording.stopAndDiscardClip();
    mp.game.graphics.notify('Editor ~r~Recording discarded');
  } else {
    mp.game.graphics.notify('~r~Not recording!');
  }

  recording = false;
}

// Bind F9 (0x78) – Start sau Save Recording
mp.keys.bind(0x78, true, () => {
  if (!recording) {
    startRecording();
  } else {
    saveRecording();
  }
});

// Bind F10 (0x79) – Discard Recording
mp.keys.bind(0x79, true, () => {
  if (recording) {
    discardRecording();
  }
});
