import { createGame as Tt, orthoRig as Rt } from "./vendor/006-three.js";
import * as nt from "./vendor/002-three.js";
function A(e = {
  x: 2.5,
  y: 3.4
}) {
  return {
    ...e,
    vx: 0,
    vy: 0,
    grounded: !1,
    wall: 0,
    facing: 1,
    coyote: 0,
    jumpBuffer: 0,
    wallLock: 0,
    squash: 0
  };
}
function me(e = {}) {
  return {
    levelIndex: 0,
    currentLevelIndex: (e.levelIndex ?? 0) + 1,
    levelMode: !1,
    phase: "ready",
    player: A(),
    elapsed: 0,
    attemptTime: 0,
    deaths: 0,
    deathTimer: 0,
    attempts: [],
    recording: [],
    replayTime: 0,
    replayDuration: 0,
    winTime: 0,
    earnedStars: 0,
    events: [],
    particles: [],
    started: !1,
    paused: !1,
    progress: {
      best: {}
    },
    keys: {},
    previousJump: !1,
    previousRetry: !1,
    previousConfirm: !1,
    previousPause: !1,
    gamepadActive: !1,
    uiAction: "",
    uiVersion: "",
    shake: 0,
    cameraX: 17,
    cameraY: 10,
    cameraZoom: 1,
    stepClock: 0,
    slideClock: 0,
    audioStarted: !1,
    musicMuted: !1,
    score: 0,
    reported: !1,
    levelVersion: 0,
    particleCursor: 0,
    recordClock: 0,
    presentationTime: 0,
    audioMusicGain: 0,
    recordingEvents: [],
    replayEventIndex: 0,
    replayCelebrated: !1,
    ...e
  };
}
var k = [{
  id: "ember-steps",
  name: "Ember Steps",
  subtitle: "Every great escape starts with a leap.",
  theme: "forge",
  width: 34,
  height: 19.125,
  spawn: {
    x: 2.5,
    y: 3.4
  },
  goal: {
    x: 4.5,
    y: 12.3,
    w: 1.65,
    h: 2.3
  },
  gold: 6,
  silver: 11,
  solids: [{
    x: 0,
    y: 0,
    w: 7.5,
    h: 3
  }, {
    x: 9,
    y: 1.9,
    w: 6,
    h: 2.5
  }, {
    x: 17,
    y: 3.4,
    w: 6,
    h: 2.5
  }, {
    x: 25,
    y: 4.9,
    w: 7.5,
    h: 2.5
  }, {
    x: 20,
    y: 8.4,
    w: 4,
    h: 1
  }, {
    x: 12,
    y: 9.8,
    w: 6,
    h: 1
  }, {
    x: 3.5,
    y: 11.3,
    w: 6.5,
    h: 1
  }, {
    x: 32.5,
    y: 3,
    w: 1.5,
    h: 8.7
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 13,
    y: 5.12,
    r: 0.72
  }, {
    x: 21,
    y: 6.62,
    r: 0.72
  }, {
    x: 14.7,
    y: 11.52,
    r: 0.72,
    axis: "x",
    range: 0.7,
    speed: 1.8
  }, {
    x: 2.8,
    y: 8.2,
    r: 1.35,
    axis: "y",
    range: 0.4,
    speed: 0.8
  }, {
    x: 30,
    y: 13.8,
    r: 1.45
  }]
}, {
  id: "the-chimney",
  name: "The Chimney",
  subtitle: "Press into a wall. Jump away. Climb.",
  theme: "quarry",
  width: 34,
  height: 19.125,
  spawn: {
    x: 12,
    y: 3.4
  },
  goal: {
    x: 29,
    y: 14.5,
    w: 1.65,
    h: 2.3
  },
  gold: 8,
  silver: 12,
  solids: [{
    x: 8,
    y: 0,
    w: 8,
    h: 3
  }, {
    x: 8,
    y: 3,
    w: 1.5,
    h: 11
  }, {
    x: 14.5,
    y: 3,
    w: 1.5,
    h: 11
  }, {
    x: 19,
    y: 12,
    w: 5,
    h: 1
  }, {
    x: 26,
    y: 13.5,
    w: 7,
    h: 1
  }, {
    x: 0,
    y: 0,
    w: 4,
    h: 5
  }, {
    x: 1,
    y: 8.5,
    w: 3,
    h: 1
  }, {
    x: 30.5,
    y: 0,
    w: 3.5,
    h: 7
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 12,
    y: 7.25,
    r: 0.66,
    axis: "y",
    range: 1.2,
    speed: 1.35
  }, {
    x: 22.4,
    y: 13.75,
    r: 0.75,
    axis: "x",
    range: 0.5,
    speed: 1.6
  }]
}, {
  id: "sawtooth-gallery",
  name: "Sawtooth Gallery",
  subtitle: "Find the rhythm. Keep your nerve.",
  theme: "belfry",
  width: 34,
  height: 19.125,
  spawn: {
    x: 2.5,
    y: 3.4
  },
  goal: {
    x: 3.7,
    y: 14,
    w: 1.65,
    h: 2.3
  },
  gold: 7,
  silver: 12,
  solids: [{
    x: 0,
    y: 0,
    w: 9,
    h: 3
  }, {
    x: 11,
    y: 0,
    w: 7,
    h: 3
  }, {
    x: 20,
    y: 0,
    w: 7,
    h: 3
  }, {
    x: 27,
    y: 3,
    w: 2,
    h: 8
  }, {
    x: 31.5,
    y: 0,
    w: 2.5,
    h: 14
  }, {
    x: 19,
    y: 10,
    w: 5.5,
    h: 1
  }, {
    x: 11,
    y: 11.5,
    w: 6,
    h: 1
  }, {
    x: 2,
    y: 13,
    w: 7,
    h: 1
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 7.1,
    y: 3.95,
    r: 0.95
  }, {
    x: 15.4,
    y: 3.9,
    r: 0.9
  }, {
    x: 24.2,
    y: 3.9,
    r: 0.9
  }, {
    x: 30.2,
    y: 8,
    r: 0.72,
    axis: "y",
    range: 2.2,
    speed: 1.5
  }, {
    x: 14.8,
    y: 13.3,
    r: 0.8,
    axis: "x",
    range: 0.8,
    speed: 2.1
  }]
}, {
  id: "split-foundry",
  name: "Split Foundry",
  subtitle: "A narrow path through the machinery.",
  theme: "forge",
  width: 34,
  height: 19.125,
  spawn: {
    x: 3,
    y: 3.4
  },
  goal: {
    x: 28.9,
    y: 14.5,
    w: 1.65,
    h: 2.3
  },
  gold: 4.5,
  silver: 6,
  solids: [{
    x: 0,
    y: 0,
    w: 6.5,
    h: 3
  }, {
    x: 8.5,
    y: 3.3,
    w: 4,
    h: 1
  }, {
    x: 14.5,
    y: 4.8,
    w: 4,
    h: 1
  }, {
    x: 20.5,
    y: 6.3,
    w: 4.5,
    h: 1
  }, {
    x: 25,
    y: 3,
    w: 1.5,
    h: 11.5
  }, {
    x: 30.5,
    y: 3,
    w: 1.5,
    h: 11.5
  }, {
    x: 26.5,
    y: 0,
    w: 4,
    h: 3
  }, {
    x: 25,
    y: 13.5,
    w: 7,
    h: 1
  }, {
    x: 7,
    y: 11,
    w: 5,
    h: 1.1
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 10.5,
    y: 5.05,
    r: 0.75,
    axis: "x",
    range: 0.55,
    speed: 1.8
  }, {
    x: 16.8,
    y: 6.65,
    r: 0.85
  }, {
    x: 28.5,
    y: 7.7,
    r: 0.76,
    axis: "y",
    range: 2,
    speed: 1.25
  }, {
    x: 6.6,
    y: 9.8,
    r: 1.65,
    axis: "y",
    range: 0.8,
    speed: 0.85
  }]
}, {
  id: "craigs-crown",
  name: "Craig's Crown",
  subtitle: "One last climb. Make every attempt count.",
  theme: "belfry",
  width: 34,
  height: 19.125,
  spawn: {
    x: 3,
    y: 3.4
  },
  goal: {
    x: 15.9,
    y: 15,
    w: 1.65,
    h: 2.3
  },
  gold: 11,
  silver: 16,
  solids: [{
    x: 0,
    y: 0,
    w: 7,
    h: 3
  }, {
    x: 9,
    y: 3.2,
    w: 4.5,
    h: 1
  }, {
    x: 15.5,
    y: 4.7,
    w: 4.5,
    h: 1
  }, {
    x: 22,
    y: 6.2,
    w: 5,
    h: 1
  }, {
    x: 28.5,
    y: 3,
    w: 1.5,
    h: 11
  }, {
    x: 32.5,
    y: 0,
    w: 1.5,
    h: 14
  }, {
    x: 22.5,
    y: 12.6,
    w: 4.5,
    h: 1
  }, {
    x: 14.5,
    y: 14,
    w: 6,
    h: 1
  }, {
    x: 1,
    y: 11,
    w: 7,
    h: 1.4
  }, {
    x: 9,
    y: 9.8,
    w: 2,
    h: 1
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 11.4,
    y: 5,
    r: 0.8,
    axis: "x",
    range: 0.6,
    speed: 1.6
  }, {
    x: 17.8,
    y: 6.65,
    r: 0.95
  }, {
    x: 24.5,
    y: 8.1,
    r: 0.9,
    axis: "x",
    range: 1.2,
    speed: 1.8
  }, {
    x: 31.2,
    y: 9.5,
    r: 0.6,
    axis: "y",
    range: 2.1,
    speed: 1.65
  }, {
    x: 25.4,
    y: 14.35,
    r: 0.75,
    axis: "x",
    range: 1.1,
    speed: 1.45
  }, {
    x: 11.9,
    y: 14.4,
    r: 1.65,
    axis: "y",
    range: 1.2,
    speed: 0.85
  }]
}, {
  id: "room-11f5bed0-37e6-4180-9855-e421e5898637",
  name: "Brett's Bazzar",
  subtitle: "A new path through the castle.",
  theme: "forge",
  width: 34,
  height: 19.125,
  spawn: {
    x: 2.5,
    y: 3.4
  },
  goal: {
    x: 29,
    y: 3,
    w: 1.65,
    h: 2.3
  },
  gold: 7.5,
  silver: 11,
  solids: [{
    x: 0,
    y: 2,
    w: 27,
    h: 1
  }, {
    x: 12.75,
    y: 6,
    w: 1.25,
    h: 9.25
  }, {
    x: 22,
    y: 12.25,
    w: 5.25,
    h: 1.25
  }, {
    x: 9,
    y: 6,
    w: 1.25,
    h: 9.25
  }],
  hazards: [{
    x: 0,
    y: -0.5,
    w: 34.25,
    h: 1.75
  }],
  saws: [{
    x: 28.5,
    y: 6.75,
    r: 0.75
  }, {
    x: 31.25,
    y: 6.75,
    r: 0.75
  }, {
    x: 28.5,
    y: 8.5,
    r: 0.75
  }, {
    x: 31.25,
    y: 8.5,
    r: 0.75
  }, {
    x: 28.5,
    y: 10.25,
    r: 0.75
  }, {
    x: 31.25,
    y: 10.25,
    r: 0.75
  }, {
    x: 31.25,
    y: 12,
    r: 0.75
  }, {
    x: 10,
    y: 8.5,
    r: 0.75
  }, {
    x: 13,
    y: 10.5,
    r: 0.75
  }, {
    x: 26.25,
    y: 5,
    r: 1.75
  }]
}, {
  id: "cinder-causeway",
  name: "Cinder Causeway",
  subtitle: "Small islands. Long leaps. Keep the flame moving.",
  theme: "forge",
  width: 34,
  height: 19.125,
  spawn: {
    x: 2.5,
    y: 3.4
  },
  goal: {
    x: 29.5,
    y: 9,
    w: 1.65,
    h: 2.3
  },
  gold: 4,
  silver: 5,
  solids: [{
    x: 0,
    y: 0,
    w: 6,
    h: 3
  }, {
    x: 8,
    y: 2.8,
    w: 4.5,
    h: 1
  }, {
    x: 15,
    y: 4.2,
    w: 4,
    h: 1
  }, {
    x: 21.5,
    y: 6,
    w: 4,
    h: 1
  }, {
    x: 28,
    y: 8,
    w: 6,
    h: 1
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 10.7,
    y: 4.5,
    r: 0.65,
    axis: "x",
    range: 0.5,
    speed: 1.5,
    phase: 0
  }, {
    x: 17,
    y: 6,
    r: 0.7,
    axis: "y",
    range: 0.3,
    speed: 1.8,
    phase: 0
  }, {
    x: 24,
    y: 7.7,
    r: 0.65,
    axis: "x",
    range: 0.6,
    speed: 1.9,
    phase: 0
  }]
}, {
  id: "ash-switchback",
  name: "Ash Switchback",
  subtitle: "Cross the embers. Turn back above the blades.",
  theme: "quarry",
  width: 34,
  height: 19.125,
  spawn: {
    x: 2.5,
    y: 3.4
  },
  goal: {
    x: 3,
    y: 12.1,
    w: 1.65,
    h: 2.3
  },
  gold: 5.5,
  silver: 7,
  solids: [{
    x: 0,
    y: 0,
    w: 6.5,
    h: 3
  }, {
    x: 8.5,
    y: 3.2,
    w: 4.5,
    h: 1
  }, {
    x: 15,
    y: 4.5,
    w: 4.5,
    h: 1
  }, {
    x: 21.5,
    y: 5.8,
    w: 4.5,
    h: 1
  }, {
    x: 28,
    y: 7.1,
    w: 5.5,
    h: 1
  }, {
    x: 21,
    y: 8.5,
    w: 4.5,
    h: 1
  }, {
    x: 14.5,
    y: 9.8,
    w: 4.5,
    h: 1
  }, {
    x: 2,
    y: 11.1,
    w: 10,
    h: 1
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 11.1,
    y: 5,
    r: 0.72
  }, {
    x: 24,
    y: 7.55,
    r: 0.7,
    axis: "x",
    range: 0.65,
    speed: 1.8,
    phase: 0
  }, {
    x: 17.2,
    y: 11.55,
    r: 0.65,
    axis: "x",
    range: 0.65,
    speed: 1.6,
    phase: 0
  }, {
    x: 8.2,
    y: 12.85,
    r: 0.7
  }]
}, {
  id: "bellows-shaft",
  name: "Bellows Shaft",
  subtitle: "Kick off the stone. Rise between the teeth.",
  theme: "forge",
  width: 34,
  height: 19.125,
  spawn: {
    x: 5,
    y: 3.4
  },
  goal: {
    x: 28.4,
    y: 14,
    w: 1.65,
    h: 2.3
  },
  gold: 8,
  silver: 10,
  solids: [{
    x: 1.5,
    y: 0,
    w: 8,
    h: 3
  }, {
    x: 1.5,
    y: 3,
    w: 1.5,
    h: 10
  }, {
    x: 8,
    y: 3,
    w: 1.5,
    h: 10
  }, {
    x: 12,
    y: 11.5,
    w: 5,
    h: 1
  }, {
    x: 19.5,
    y: 12.2,
    w: 5,
    h: 1
  }, {
    x: 27,
    y: 13,
    w: 6,
    h: 1
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 5.5,
    y: 7.5,
    r: 0.55,
    axis: "y",
    range: 1,
    speed: 1.2,
    phase: 0
  }, {
    x: 14.9,
    y: 13.2,
    r: 0.65,
    axis: "x",
    range: 0.55,
    speed: 1.7,
    phase: 0
  }, {
    x: 22,
    y: 13.95,
    r: 0.7
  }]
}, {
  id: "pendulum-walk",
  name: "Pendulum Walk",
  subtitle: "Watch the swing. Leap through the opening.",
  theme: "belfry",
  width: 34,
  height: 19.125,
  spawn: {
    x: 2.5,
    y: 3.4
  },
  goal: {
    x: 29.5,
    y: 6.6,
    w: 1.65,
    h: 2.3
  },
  gold: 3,
  silver: 5,
  solids: [{
    x: 0,
    y: 0,
    w: 7,
    h: 3
  }, {
    x: 9,
    y: 2.9,
    w: 5,
    h: 1
  }, {
    x: 16,
    y: 3.8,
    w: 5,
    h: 1
  }, {
    x: 23,
    y: 4.7,
    w: 4,
    h: 1
  }, {
    x: 29,
    y: 5.6,
    w: 5,
    h: 1
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 8,
    y: 5.6,
    r: 0.72,
    axis: "y",
    range: 1.5,
    speed: 1.6,
    phase: 0
  }, {
    x: 15,
    y: 6.7,
    r: 0.7,
    axis: "y",
    range: 1.6,
    speed: 1.8,
    phase: 1.9
  }, {
    x: 22,
    y: 7.5,
    r: 0.75,
    axis: "y",
    range: 1.5,
    speed: 1.5,
    phase: 0.8
  }, {
    x: 28,
    y: 8.3,
    r: 0.6,
    axis: "y",
    range: 1.35,
    speed: 2,
    phase: 2.2
  }]
}, {
  id: "lantern-descent",
  name: "Lantern Descent",
  subtitle: "The way out is down. Choose where you land.",
  theme: "quarry",
  width: 34,
  height: 19.125,
  spawn: {
    x: 3,
    y: 14.9
  },
  goal: {
    x: 29.5,
    y: 3,
    w: 1.65,
    h: 2.3
  },
  gold: 2.8,
  silver: 4,
  solids: [{
    x: 0,
    y: 13.5,
    w: 6,
    h: 1
  }, {
    x: 8.5,
    y: 11.3,
    w: 4,
    h: 1
  }, {
    x: 15,
    y: 8.8,
    w: 4,
    h: 1
  }, {
    x: 21.5,
    y: 5.8,
    w: 4,
    h: 1
  }, {
    x: 28,
    y: 0,
    w: 6,
    h: 3
  }, {
    x: 0,
    y: 0,
    w: 4,
    h: 6
  }, {
    x: 10,
    y: 0,
    w: 2.5,
    h: 6
  }, {
    x: 17,
    y: 0,
    w: 2,
    h: 3
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 10.6,
    y: 13,
    r: 0.65,
    axis: "x",
    range: 0.6,
    speed: 1.7,
    phase: 0
  }, {
    x: 16.9,
    y: 10.5,
    r: 0.7
  }, {
    x: 23.5,
    y: 7.55,
    r: 0.75,
    axis: "x",
    range: 0.6,
    speed: 1.6,
    phase: 0
  }, {
    x: 26.8,
    y: 4.6,
    r: 0.65,
    axis: "y",
    range: 1.1,
    speed: 1.2,
    phase: 0
  }]
}, {
  id: "counterweight-court",
  name: "Counterweight Court",
  subtitle: "Climb against the weight. Return above the teeth.",
  theme: "quarry",
  width: 34,
  height: 19.125,
  spawn: {
    x: 30,
    y: 3.4
  },
  goal: {
    x: 27.5,
    y: 14.5,
    w: 1.65,
    h: 2.3
  },
  gold: 9,
  silver: 12,
  solids: [{
    x: 27,
    y: 0,
    w: 7,
    h: 3
  }, {
    x: 20,
    y: 3.5,
    w: 5,
    h: 1
  }, {
    x: 13,
    y: 5,
    w: 5,
    h: 1
  }, {
    x: 6,
    y: 6.5,
    w: 5,
    h: 1
  }, {
    x: 2,
    y: 2,
    w: 1.5,
    h: 9
  }, {
    x: 0,
    y: 0,
    w: 1,
    h: 11
  }, {
    x: 5,
    y: 10,
    w: 5,
    h: 1
  }, {
    x: 12,
    y: 11.2,
    w: 5,
    h: 1
  }, {
    x: 19,
    y: 12.5,
    w: 5,
    h: 1
  }, {
    x: 26,
    y: 13.5,
    w: 7,
    h: 1
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 22.5,
    y: 5.2,
    r: 0.7,
    axis: "x",
    range: 0.65,
    speed: 1.7
  }, {
    x: 15.5,
    y: 6.75,
    r: 0.75
  }, {
    x: 8.6,
    y: 8.2,
    r: 0.7,
    axis: "x",
    range: 0.7,
    speed: 1.5
  }, {
    x: 14.5,
    y: 12.95,
    r: 0.75,
    axis: "x",
    range: 0.85,
    speed: 1.9
  }, {
    x: 21.5,
    y: 14.2,
    r: 0.7,
    axis: "x",
    range: 0.7,
    speed: 1.35
  }]
}, {
  id: "furnace-switchback",
  name: "Furnace Switchback",
  subtitle: "Turn at each landing. The furnace never rests.",
  theme: "forge",
  width: 34,
  height: 19.125,
  spawn: {
    x: 3,
    y: 3.4
  },
  goal: {
    x: 27.5,
    y: 15,
    w: 1.65,
    h: 2.3
  },
  gold: 6.5,
  silver: 9,
  solids: [{
    x: 0,
    y: 0,
    w: 6,
    h: 3
  }, {
    x: 8,
    y: 3.5,
    w: 5,
    h: 1
  }, {
    x: 15,
    y: 5,
    w: 5,
    h: 1
  }, {
    x: 22,
    y: 6.5,
    w: 5,
    h: 1
  }, {
    x: 28.5,
    y: 3,
    w: 1.5,
    h: 8
  }, {
    x: 32.5,
    y: 0,
    w: 1.5,
    h: 11
  }, {
    x: 22,
    y: 10,
    w: 5,
    h: 1
  }, {
    x: 15,
    y: 11.5,
    w: 5,
    h: 1
  }, {
    x: 8,
    y: 13,
    w: 5,
    h: 1
  }, {
    x: 15,
    y: 15,
    w: 5,
    h: 1
  }, {
    x: 22,
    y: 14,
    w: 10,
    h: 1
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 10.5,
    y: 5.2,
    r: 0.7,
    axis: "x",
    range: 0.55,
    speed: 2
  }, {
    x: 17.7,
    y: 6.75,
    r: 0.75
  }, {
    x: 30.9,
    y: 7,
    r: 0.62,
    axis: "y",
    range: 1.6,
    speed: 1.45
  }, {
    x: 17.5,
    y: 13.2,
    r: 0.7,
    axis: "x",
    range: 0.55,
    speed: 1.6
  }, {
    x: 24.5,
    y: 15.75,
    r: 0.75,
    axis: "x",
    range: 0.8,
    speed: 1.7
  }]
}, {
  id: "clockwork-divide",
  name: "Clockwork Divide",
  subtitle: "Descend beneath the hanging wall. Climb into daylight.",
  theme: "belfry",
  width: 34,
  height: 19.125,
  spawn: {
    x: 3,
    y: 12.4
  },
  goal: {
    x: 29,
    y: 14.5,
    w: 1.65,
    h: 2.3
  },
  gold: 7,
  silver: 10,
  solids: [{
    x: 0,
    y: 11,
    w: 7,
    h: 1
  }, {
    x: 9,
    y: 3,
    w: 11,
    h: 1
  }, {
    x: 13,
    y: 8,
    w: 2,
    h: 11.125
  }, {
    x: 22,
    y: 5,
    w: 4,
    h: 1
  }, {
    x: 26.5,
    y: 3,
    w: 1.5,
    h: 10
  }, {
    x: 32.5,
    y: 0,
    w: 1.5,
    h: 14.5
  }, {
    x: 26.5,
    y: 13.5,
    w: 7.5,
    h: 1
  }, {
    x: 20,
    y: 9,
    w: 3,
    h: 1
  }, {
    x: 1,
    y: 5,
    w: 4,
    h: 1
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 8,
    y: 8.4,
    r: 0.72,
    axis: "y",
    range: 1.2,
    speed: 1.25
  }, {
    x: 16.3,
    y: 4.7,
    r: 0.7,
    axis: "x",
    range: 0.65,
    speed: 1.6
  }, {
    x: 23.5,
    y: 6.7,
    r: 0.7,
    axis: "x",
    range: 0.6,
    speed: 1.85
  }, {
    x: 30.2,
    y: 9,
    r: 0.7,
    axis: "y",
    range: 2,
    speed: 1.4
  }, {
    x: 19,
    y: 12.5,
    r: 1.05,
    axis: "y",
    range: 1,
    speed: 0.85
  }]
}, {
  id: "the-broken-spine",
  name: "The Broken Spine",
  subtitle: "Find a foothold on the castle's fractured backbone.",
  theme: "quarry",
  width: 34,
  height: 19.125,
  spawn: {
    x: 3,
    y: 3.4
  },
  goal: {
    x: 27.8,
    y: 15,
    w: 1.65,
    h: 2.3
  },
  gold: 5.5,
  silver: 8,
  solids: [{
    x: 0,
    y: 0,
    w: 7,
    h: 3
  }, {
    x: 9,
    y: 3.5,
    w: 4.5,
    h: 1
  }, {
    x: 16,
    y: 2,
    w: 1.5,
    h: 12
  }, {
    x: 11,
    y: 7,
    w: 3,
    h: 1
  }, {
    x: 11,
    y: 10.5,
    w: 3,
    h: 1
  }, {
    x: 7,
    y: 12.5,
    w: 3,
    h: 1
  }, {
    x: 19.5,
    y: 11.5,
    w: 4,
    h: 1
  }, {
    x: 25.5,
    y: 14,
    w: 7.5,
    h: 1
  }, {
    x: 23.5,
    y: 8,
    w: 1.5,
    h: 5
  }, {
    x: 29,
    y: 4,
    w: 5,
    h: 1
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 11.2,
    y: 5.2,
    r: 0.7,
    axis: "x",
    range: 0.6,
    speed: 1.6
  }, {
    x: 14.8,
    y: 8.8,
    r: 0.64,
    axis: "y",
    range: 0.65,
    speed: 1.35
  }, {
    x: 18.6,
    y: 9.7,
    r: 0.8,
    axis: "y",
    range: 1.2,
    speed: 1.15
  }, {
    x: 21.5,
    y: 13.25,
    r: 0.75,
    axis: "x",
    range: 0.5,
    speed: 1.9
  }, {
    x: 28.1,
    y: 9,
    r: 1.25,
    axis: "y",
    range: 1.3,
    speed: 0.85
  }]
}, {
  id: "the-last-bell",
  name: "The Last Bell",
  subtitle: "Cross the crown of the castle. Ring in your escape.",
  theme: "belfry",
  width: 34,
  height: 19.125,
  spawn: {
    x: 3,
    y: 3.4
  },
  goal: {
    x: 29.5,
    y: 15.2,
    w: 1.65,
    h: 2.3
  },
  gold: 15,
  silver: 22,
  solids: [{
    x: 0,
    y: 0,
    w: 7,
    h: 3
  }, {
    x: 9,
    y: 3.5,
    w: 4,
    h: 1
  }, {
    x: 15,
    y: 5,
    w: 4,
    h: 1
  }, {
    x: 21,
    y: 6.5,
    w: 5,
    h: 1
  }, {
    x: 27.5,
    y: 3,
    w: 1.5,
    h: 8
  }, {
    x: 32,
    y: 0,
    w: 2,
    h: 11
  }, {
    x: 20.5,
    y: 10,
    w: 5,
    h: 1
  }, {
    x: 13.5,
    y: 11.5,
    w: 5,
    h: 1
  }, {
    x: 6.5,
    y: 13,
    w: 5,
    h: 1
  }, {
    x: 1.5,
    y: 9,
    w: 1.5,
    h: 7
  }, {
    x: 6.5,
    y: 15.5,
    w: 5,
    h: 0.8
  }, {
    x: 14.5,
    y: 14.8,
    w: 4,
    h: 0.8
  }, {
    x: 21.5,
    y: 15,
    w: 4,
    h: 0.8
  }, {
    x: 28,
    y: 14.2,
    w: 6,
    h: 1
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }],
  saws: [{
    x: 11,
    y: 5.2,
    r: 0.7,
    axis: "x",
    range: 0.45,
    speed: 1.8
  }, {
    x: 17,
    y: 6.75,
    r: 0.75
  }, {
    x: 30.5,
    y: 7.5,
    r: 0.62,
    axis: "y",
    range: 1.8,
    speed: 1.45
  }, {
    x: 16,
    y: 13.2,
    r: 0.7,
    axis: "x",
    range: 0.7,
    speed: 1.6
  }, {
    x: 16.5,
    y: 16.4,
    r: 0.7,
    axis: "x",
    range: 0.7,
    speed: 1.25
  }, {
    x: 23.5,
    y: 16.55,
    r: 0.75,
    axis: "x",
    range: 0.65,
    speed: 1.75
  }, {
    x: 26.5,
    y: 14,
    r: 1
  }, {
    x: 13.25,
    y: 15.5,
    r: 0.5
  }, {
    x: 20,
    y: 15.5,
    r: 0.5
  }]
}, {
  id: "room-6bd0cdd0-535f-4c6e-98aa-6f525e30bb67",
  name: "Shoot the Gap",
  subtitle: "Don't blow chunks",
  theme: "forge",
  width: 34,
  height: 19.125,
  spawn: {
    x: 2.5,
    y: 3.4
  },
  goal: {
    x: 29,
    y: 3,
    w: 1.65,
    h: 2.3
  },
  gold: 12,
  silver: 16,
  solids: [{
    x: 1.5,
    y: 2,
    w: 12.5,
    h: 0.75
  }, {
    x: 16,
    y: 3.25,
    w: 11.5,
    h: 0.75
  }, {
    x: 10,
    y: 5.75,
    w: 15.25,
    h: 0.75
  }, {
    x: 3.75,
    y: 7.25,
    w: 5.75,
    h: 0.75
  }, {
    x: 5.25,
    y: 9.5,
    w: 19.25,
    h: 0.75
  }, {
    x: 31.75,
    y: 5,
    w: 0.75,
    h: 2.5
  }, {
    x: 0,
    y: 12,
    w: 22.5,
    h: 0.75
  }],
  hazards: [{
    x: -0.25,
    y: -0.5,
    w: 34.5,
    h: 1.75
  }],
  saws: [{
    x: 27.5,
    y: 4.75,
    r: 0.75
  }, {
    x: 3.75,
    y: 8.75,
    r: 0.75,
    axis: "x",
    range: 1.55,
    speed: 1.55
  }, {
    x: 28,
    y: 6.5,
    r: 0.75
  }, {
    x: 28,
    y: 8.25,
    r: 0.75
  }, {
    x: 29.5,
    y: 11,
    r: 2.25
  }, {
    x: 25.75,
    y: 11.25,
    r: 1.25
  }]
}, {
  id: "room-9f812d56-5a8e-45af-a0b0-155e5b2244cf",
  name: "Scrub a Dub",
  subtitle: "What goes up goes around",
  theme: "forge",
  width: 34,
  height: 19.125,
  spawn: {
    x: 2.5,
    y: 3.4
  },
  goal: {
    x: 29,
    y: 3,
    w: 1.65,
    h: 2.3
  },
  gold: 19,
  silver: 24,
  solids: [{
    x: 0,
    y: 0,
    w: 8.25,
    h: 3
  }, {
    x: 4.5,
    y: 6,
    w: 0.75,
    h: 11
  }, {
    x: 7.5,
    y: 3,
    w: 0.75,
    h: 12
  }, {
    x: 10,
    y: 8.75,
    w: 0.75,
    h: 10.25
  }, {
    x: 12.5,
    y: 2.25,
    w: 0.75,
    h: 12.5
  }, {
    x: 15,
    y: 9,
    w: 0.75,
    h: 10
  }, {
    x: 23,
    y: 11.5,
    w: 1.5,
    h: 1.5
  }, {
    x: 18.75,
    y: 5,
    w: 0.75,
    h: 8
  }, {
    x: 0,
    y: 19.25,
    w: 34,
    h: 0.5
  }],
  hazards: [{
    x: 8.25,
    y: 0,
    w: 25.75,
    h: 2.25
  }],
  saws: [{
    x: 7.75,
    y: 17,
    r: 0.75,
    axis: "y",
    range: 2,
    speed: 1
  }, {
    x: 12.75,
    y: 17,
    r: 0.75,
    axis: "y",
    range: 2,
    speed: 1
  }, {
    x: 26.25,
    y: 5.5,
    r: 2.25
  }, {
    x: 19,
    y: 14.5,
    r: 1
  }]
}, {
  id: "room-9a7f3255-274e-4bc8-b4eb-f155b8ec36c1",
  name: "19th Green",
  subtitle: "2 putting ain't gonna cut it",
  theme: "forge",
  width: 34,
  height: 19.125,
  spawn: {
    x: 2.5,
    y: 3.4
  },
  goal: {
    x: 25.25,
    y: 0.75,
    w: 1.65,
    h: 2.3
  },
  gold: 12,
  silver: 20,
  solids: [{
    x: 0,
    y: 0,
    w: 19.5,
    h: 3
  }, {
    x: 19.25,
    y: 14,
    w: 1.25,
    h: 1.25
  }, {
    x: 3.75,
    y: 14,
    w: 8,
    h: 1.25
  }, {
    x: 12,
    y: 5.25,
    w: 0.75,
    h: 8.5
  }, {
    x: 0.5,
    y: 5.25,
    w: 8.5,
    h: 0.75
  }, {
    x: 0.5,
    y: 6,
    w: 0.75,
    h: 7.75
  }],
  hazards: [],
  saws: [{
    x: 23.25,
    y: 15,
    r: 1.25
  }, {
    x: 29.75,
    y: 15,
    r: 1.25
  }, {
    x: 24.75,
    y: 12.75,
    r: 0.75
  }, {
    x: 29.5,
    y: 12.75,
    r: 0.75
  }, {
    x: 25.5,
    y: 11,
    r: 0.75
  }, {
    x: 29.75,
    y: 11,
    r: 0.75
  }, {
    x: 26.25,
    y: 9.25,
    r: 0.75
  }, {
    x: 29.5,
    y: 9.25,
    r: 0.75
  }, {
    x: 25.75,
    y: 7.5,
    r: 0.75
  }, {
    x: 29,
    y: 7.5,
    r: 0.75
  }, {
    x: 25.25,
    y: 5.75,
    r: 0.75
  }, {
    x: 28.25,
    y: 5.75,
    r: 0.75
  }, {
    x: 24.5,
    y: 4,
    r: 0.75
  }, {
    x: 27.75,
    y: 4,
    r: 0.75
  }, {
    x: 23.25,
    y: 1.5,
    r: 1.75
  }, {
    x: 16.25,
    y: 11.5,
    r: 3.25
  }, {
    x: 0.75,
    y: 9.75,
    r: 0.75
  }]
}, {
  id: "room-18ff5f1f-f189-4ff6-b335-98c594c7ddf6",
  name: "For Twenty",
  subtitle: "That last step's a doozy",
  theme: "forge",
  width: 34,
  height: 19.125,
  spawn: {
    x: 2.5,
    y: 3.4
  },
  goal: {
    x: 29,
    y: 3,
    w: 1.65,
    h: 2.3
  },
  gold: 9,
  silver: 15,
  solids: [{
    x: 0,
    y: 0,
    w: 3.75,
    h: 3
  }, {
    x: 8,
    y: 6,
    w: 0.75,
    h: 2
  }, {
    x: 4,
    y: 9,
    w: 1,
    h: 2
  }, {
    x: 8,
    y: 12,
    w: 1,
    h: 2
  }, {
    x: 4,
    y: 15,
    w: 1,
    h: 2
  }, {
    x: 16,
    y: 10,
    w: 1,
    h: 1
  }],
  hazards: [{
    x: 3.75,
    y: 0,
    w: 30.25,
    h: 2
  }],
  saws: [{
    x: 8.75,
    y: 10,
    r: 1.5
  }, {
    x: 8.75,
    y: 15.25,
    r: 0.75
  }, {
    x: 4,
    y: 13,
    r: 1.5
  }, {
    x: 21.25,
    y: 8.75,
    r: 2.75
  }, {
    x: 21.25,
    y: 15.5,
    r: 2
  }]
}, {
  id: "room-d6c01add-165b-4d2d-a0ec-a01aa3a0f985",
  name: "ID Please",
  subtitle: "Don't slow down",
  theme: "forge",
  width: 34,
  height: 19.125,
  spawn: {
    x: 2.5,
    y: 3.4
  },
  goal: {
    x: 29.75,
    y: 3.5,
    w: 1.65,
    h: 2.3
  },
  gold: 4.2,
  silver: 6.5,
  solids: [{
    x: 0,
    y: 0,
    w: 5,
    h: 3
  }, {
    x: 12,
    y: 3,
    w: 0.75,
    h: 1
  }, {
    x: 21,
    y: 3,
    w: 0.75,
    h: 1
  }, {
    x: 25.5,
    y: 6,
    w: 0.25,
    h: 2.25
  }],
  hazards: [{
    x: 5,
    y: 0,
    w: 29,
    h: 2
  }],
  saws: [{
    x: 25.75,
    y: 8.75,
    r: 0.25
  }, {
    x: 25.75,
    y: 5.5,
    r: 0.25
  }]
}, {
  id: "room-041537db-962f-4af8-9042-9141f18dec9d",
  name: "I Don't Know About You",
  subtitle: "Even I didn't finish this one",
  theme: "forge",
  width: 34,
  height: 19.125,
  spawn: {
    x: 2.5,
    y: 3.4
  },
  goal: {
    x: 29.25,
    y: 16,
    w: 1.65,
    h: 2.3
  },
  gold: 16,
  silver: 24,
  solids: [{
    x: 0,
    y: 0,
    w: 6.5,
    h: 3
  }, {
    x: 31.75,
    y: 3.25,
    w: 0.15,
    h: 5.5
  }, {
    x: 27.75,
    y: 7.5,
    w: 0.25,
    h: 14.25
  }, {
    x: 24.75,
    y: 3.25,
    w: 0.25,
    h: 12
  }, {
    x: 20.75,
    y: 7,
    w: 0.4,
    h: 14.75
  }, {
    x: 33.25,
    y: 9.75,
    w: 0.25,
    h: 7.5
  }, {
    x: 9.5,
    y: 5,
    w: 0.5,
    h: 0.5
  }, {
    x: 13.5,
    y: 7.5,
    w: 0.5,
    h: 0.5
  }, {
    x: 18.5,
    y: 3.25,
    w: 0.25,
    h: 3.75
  }],
  hazards: [{
    x: 6.5,
    y: 0,
    w: 27.5,
    h: 2.5
  }],
  saws: [{
    x: 29.25,
    y: 3.75,
    r: 0.75
  }, {
    x: 28,
    y: 12,
    r: 1.25
  }, {
    x: 24.75,
    y: 9,
    r: 1
  }, {
    x: 20.75,
    y: 13,
    r: 1
  }, {
    x: 24.75,
    y: 15.5,
    r: 0.25
  }, {
    x: 30.5,
    y: 12,
    r: 0.75,
    axis: "y",
    range: 2.5,
    speed: 2
  }, {
    x: 31.75,
    y: 9.25,
    r: 0.5
  }, {
    x: 33,
    y: 15.25,
    r: 0.75
  }]
}];
function he(e) {
  let a = e.localSession.state,
    r = a?.castleTimes ?? a?.castleProgress?.best,
    n = {};
  if (r && typeof r == "object") for (let [t, o] of Object.entries(r)) typeof o == "number" && Number.isFinite(o) && o > 0 && (n[t] = o);
  return {
    best: n
  };
}
function ue(e, a) {
  let {
    castleProgress: r,
    ...n
  } = e.localSession.state ?? {};
  e.localSession.saveState({
    ...n,
    castleTimes: {
      ...a.best
    }
  });
}
function U(e, a, r) {
  let n = a ? r?.levelIndex ?? a.currentLevelIndex : e.localSession.info?.levelBased?.progress.currentLevelIndex ?? 1,
    t = Number.isInteger(n) && n >= 1 && n <= k.length ? n : a?.currentLevelIndex ?? 1,
    o = t - 1,
    i = k[o],
    s = a?.reported && a.earnedStars === 0 && a.levelIndex === o;
  return me({
    levelIndex: o,
    currentLevelIndex: t,
    levelMode: !!e.localSession.info?.levelBased,
    player: A(i.spawn),
    progress: a?.progress ?? he(e),
    levelVersion: (a?.levelVersion ?? -1) + 1,
    cameraX: i.width / 2,
    cameraY: i.height / 2,
    musicMuted: a?.musicMuted ?? !1,
    gamepadActive: a?.gamepadActive ?? !1,
    attempts: s ? a.attempts.filter(c => !c.won) : [],
    deaths: s ? a.deaths : 0
  });
}
var ye = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "KeyW", "KeyS", "KeyA", "KeyD", "KeyR", "Escape", "Enter", "ShiftLeft", "ShiftRight"]);
function fe(e, a) {
  window.addEventListener("keydown", r => {
    !ye.has(r.code) || a().reported || (r.preventDefault(), a().keys[r.code] = !0, a().gamepadActive = !1, e.audio.unlock());
  }), window.addEventListener("keyup", r => {
    a().reported || (ye.has(r.code) && r.preventDefault(), a().keys[r.code] = !1);
  }), window.addEventListener("blur", () => {
    let r = a();
    r.reported || (r.keys = {}, r.phase === "playing" && (r.paused = !0));
  });
}
function we(e) {
  let a = e.keys,
    r = +!!(a.KeyD || a.ArrowRight) - +!!(a.KeyA || a.ArrowLeft),
    n = !!(a.Space || a.KeyW || a.ArrowUp),
    t = !!(a.ShiftLeft || a.ShiftRight),
    o = !!a.KeyR,
    i = !!(a.Enter || a.Space),
    s = !!a.Escape;
  for (let p of navigator.getGamepads?.() ?? []) {
    if (!p?.connected) continue;
    let l = x => p.buttons[x]?.pressed ?? !1,
      d = Math.abs(p.axes[0] ?? 0) > 0.18 ? p.axes[0] : 0,
      h = l(15) ? 1 : l(14) ? -1 : d;
    (h || p.buttons.some(x => x.pressed)) && (e.gamepadActive = !0), h && (r = h), n ||= l(0), t ||= l(2) || l(5) || l(7), o ||= l(3), i ||= l(0), s ||= l(9);
    break;
  }
  let c = {
    move: r,
    jump: n,
    jumpPressed: n && !e.previousJump,
    jumpReleased: !n && e.previousJump,
    sprint: t,
    retry: o && !e.previousRetry,
    confirm: i && !e.previousConfirm,
    pause: s && !e.previousPause
  };
  return e.previousJump = n, e.previousRetry = o, e.previousConfirm = i, e.previousPause = s, c;
}
function Y(e, a) {
  return a <= e.gold ? 3 : a <= e.silver ? 2 : e.bronze == null || a <= e.bronze ? 1 : 0;
}
function W(e, a, r = 0) {
  return e.x + 0.29 - r > a.x + 1e-5 && e.x - 0.29 + r < a.x + a.w - 1e-5 && e.y + 0.4 - r > a.y + 1e-5 && e.y - 0.4 + r < a.y + a.h - 1e-5;
}
function Z(e, a) {
  for (let r of a.solids) if (!(e.y + 0.4 - 0.06 <= r.y || e.y - 0.4 + 0.06 >= r.y + r.h)) {
    if (Math.abs(e.x + 0.29 - r.x) < 0.035) return 1;
    if (Math.abs(e.x - 0.29 - r.x - r.w) < 0.035) return -1;
  }
  return 0;
}
function ge(e, a, r) {
  let n = Math.max(1, Math.ceil(Math.max(Math.abs(e.vx), Math.abs(e.vy)) * r / 0.12)),
    t = r / n;
  e.grounded = !1;
  for (let o = 0; o < n; o++) {
    e.x += e.vx * t;
    for (let i of a.solids) W(e, i) && (e.vx > 0 ? e.x = i.x - 0.29 : e.vx < 0 && (e.x = i.x + i.w + 0.29), e.vx = 0);
    e.y += e.vy * t;
    for (let i of a.solids) W(e, i) && (e.vy < 0 ? (e.y = i.y + i.h + 0.4, e.grounded = !0) : e.vy > 0 && (e.y = i.y - 0.4), e.vy = 0);
  }
  if (e.vy === 0) for (let o of a.solids) e.x + 0.29 > o.x + 1e-5 && e.x - 0.29 < o.x + o.w - 1e-5 && Math.abs(e.y - 0.4 - o.y - o.h) < 0.002 && (e.grounded = !0);
  e.wall = Z(e, a);
}
function it(e, a) {
  let r = Math.sin(a * (e.speed ?? 1) + (e.phase ?? 0)) * (e.range ?? 0);
  return {
    x: e.x + (e.axis === "x" ? r : 0),
    y: e.y + (e.axis === "y" ? r : 0)
  };
}
function be(e, a) {
  let r = e.player;
  return r.y < -1 || r.x < -1 || r.x > a.width + 1 || r.y > a.height + 3 || a.hazards.some(n => W(r, n, 0.055)) ? !0 : a.saws.some(n => {
    let t = it(n, e.attemptTime),
      o = t.x - Math.max(r.x - 0.29 + 0.055, Math.min(t.x, r.x + 0.29 - 0.055)),
      i = t.y - Math.max(r.y - 0.4 + 0.055, Math.min(t.y, r.y + 0.4 - 0.055));
    return o * o + i * i < (n.r * 0.88) ** 2;
  });
}
function ve(e, a) {
  return W(e.player, a.goal, 0.06);
}
var Ee = (e, a, r) => e < a ? Math.min(a, e + r) : Math.max(a, e - r);
function Me(e, a, r, n) {
  let t = e.player,
    o = t.grounded,
    i = Math.max(-1, Math.min(1, r.move));
  if (t.wall = Z(t, a), t.coyote = t.grounded ? 0.1 : Math.max(0, t.coyote - n), t.jumpBuffer = r.jumpPressed ? 0.12 : Math.max(0, t.jumpBuffer - n), t.wallLock = Math.max(0, t.wallLock - n), t.squash = Ee(t.squash, 0, n * 2.8), Math.abs(i) > 0.1 && (t.facing = Math.sign(i)), t.wallLock === 0) {
    let p = r.sprint ? 11.2 : 8.5,
      l = Math.abs(i) > 0.1 ? t.grounded ? 90 : 58 : t.grounded ? 100 : 26;
    t.vx = Ee(t.vx, i * p, l * n);
  }
  t.jumpBuffer > 0 && (t.coyote > 0 || t.wall !== 0) && (t.coyote > 0 ? (t.vy = 13.8, e.events.push({
    type: "jump",
    x: t.x,
    y: t.y - 0.4
  })) : (t.vx = -t.wall * 9.4, t.vy = 13.5, t.facing = -t.wall, t.wallLock = 0.105, e.events.push({
    type: "wallJump",
    x: t.x + t.wall * 0.29,
    y: t.y
  })), t.grounded = !1, t.coyote = 0, t.jumpBuffer = 0, t.squash = -0.2), r.jumpReleased && t.vy > 5 && (t.vy = 5), t.vy = Math.max(-23, t.vy - (t.vy < 0 ? 42 : 34) * n), t.wall !== 0 && i * t.wall > 0.1 && t.vy < 0 && !t.grounded && t.wallLock === 0 ? (t.vy = Math.max(t.vy, -3.1), e.slideClock += n, e.slideClock >= 0.075 && (e.slideClock = 0, e.events.push({
    type: "slide",
    x: t.x + t.wall * 0.29,
    y: t.y - 0.24
  }))) : e.slideClock = 0;
  let c = t.vy;
  ge(t, a, n), !o && t.grounded && c < -2.5 && (t.squash = Math.min(0.3, -c * 0.015), e.events.push({
    type: "land",
    x: t.x,
    y: t.y - 0.4
  })), t.grounded && Math.abs(t.vx) > 1 ? (e.stepClock += n, e.stepClock >= (r.sprint ? 0.12 : 0.17) && (e.stepClock = 0, e.events.push({
    type: "step",
    x: t.x,
    y: t.y - 0.4
  }))) : e.stepClock = 0;
}
function Q(e, a) {
  if (e.phase !== "playing") return;
  for (let n of e.events) {
    if (n.type !== "jump" && n.type !== "wallJump" && n.type !== "land" && n.type !== "step" && n.type !== "slide") continue;
    let t = !1;
    for (let o = e.recordingEvents.length - 1; o >= 0 && e.recordingEvents[o].t === e.attemptTime; o--) {
      let i = e.recordingEvents[o];
      if (i.type === n.type && i.x === n.x && i.y === n.y) {
        t = !0;
        break;
      }
    }
    t || e.recordingEvents.push({
      ...n,
      t: e.attemptTime
    });
  }
  if (e.recordClock += a, e.recordClock < 1 / 60 && e.recording.length) return;
  e.recordClock %= 1 / 60;
  let r = e.player;
  e.recording.push({
    t: e.attemptTime,
    x: r.x,
    y: r.y,
    facing: r.facing,
    vx: r.vx,
    vy: r.vy,
    wall: r.wall
  });
}
function ee(e, a) {
  let r = e.player;
  e.recording.push({
    t: e.attemptTime,
    x: r.x,
    y: r.y,
    facing: r.facing,
    vx: r.vx,
    vy: r.vy,
    wall: r.wall
  }), e.attempts.push({
    frames: e.recording,
    events: e.recordingEvents,
    duration: e.attemptTime,
    won: a
  }), e.recording = [], e.recordingEvents = [], e.replayEventIndex = 0, e.replayCelebrated = !1;
}
function te(e, a) {
  let r = e.frames;
  if (!r.length || a > e.duration && !e.won) return null;
  if (a <= r[0].t) return r[0];
  if (a >= r[r.length - 1].t) return r[r.length - 1];
  let n = 0,
    t = r.length - 1;
  for (; t - n > 1;) {
    let c = n + t >>> 1;
    r[c].t <= a ? n = c : t = c;
  }
  let o = r[n],
    i = r[t],
    s = (a - o.t) / Math.max(0.001, i.t - o.t);
  return {
    t: a,
    x: o.x + (i.x - o.x) * s,
    y: o.y + (i.y - o.y) * s,
    facing: o.facing,
    vx: o.vx + (i.vx - o.vx) * s,
    vy: o.vy + (i.vy - o.vy) * s,
    wall: o.wall
  };
}
function Te(e, a) {
  e.replayTime += a;
  let r = e.attempts.find(t => t.won),
    n = r && te(r, e.replayTime);
  if (n && Object.assign(e.player, n, {
    grounded: Math.abs(n.vy) < 0.05 && n.wall === 0
  }), r && e.replayTime >= 0) {
    let t = r.events ?? [];
    for (; e.replayEventIndex < t.length && t[e.replayEventIndex].t <= e.replayTime + 1e-6;) {
      let {
        type: o,
        x: i,
        y: s
      } = t[e.replayEventIndex++];
      e.events.push({
        type: o,
        x: i,
        y: s
      });
    }
    !e.replayCelebrated && e.replayTime >= r.duration && (e.replayCelebrated = !0, e.events.push({
      type: "win",
      x: e.player.x,
      y: e.player.y
    }));
  }
  return e.replayTime > e.replayDuration + 0.8;
}
var Re = {
    jump: "./assets/jump-655S.wav",
    wallJump: "./assets/wall-jump-SG6e.wav",
    land: "./assets/land-elA8.wav",
    slide: "./assets/slide-qIIz.wav",
    step: "./assets/step-QlEN.wav",
    death: "./assets/death-1hFI.wav",
    respawn: "./assets/respawn-uH4H.wav",
    win: "./assets/win-97cD.wav",
    select: "./assets/select-vrMI.wav",
    castleMusic: "./assets/castle-music-w1Zv.mpeg"
  },
  ct = {
    jump: 0.49,
    wallJump: 0.55,
    land: 0.4,
    slide: 0.16,
    step: 0.2,
    death: 0.66,
    respawn: 0.39,
    win: 0.63,
    select: 0.31
  };
function ke(e) {
  e.audio.playSfx("win", {
    volume: 0.48,
    pan: 0
  }), e.audio.stopMusic(0.6);
}
function He(e, a, r) {
  a.started && !a.audioStarted && (e.audio.unlock().catch(o => e.localSession.reportError(o)), e.audio.playMusic("castleMusic", {
    volume: 1,
    loop: !0,
    fadeIn: 0.7
  }), a.audioStarted = !0), e.audio.sfxVolume = 0.82;
  let n = a.paused ? 0.1 : a.phase === "complete" ? 0.23 : a.phase === "replay" ? 0.29 : 0.4,
    t = a.musicMuted ? 0 : n;
  a.audioMusicGain += (t - a.audioMusicGain) * (1 - Math.exp(-r / 0.05)), e.audio.musicVolume = a.audioMusicGain;
  for (let o of a.events) {
    let i = Math.max(-0.55, Math.min(0.55, (o.x - a.cameraX) / 18)),
      c = o.type === "step" || o.type === "land" || o.type === "slide" ? 0.94 + 0.12 * (0.5 + 0.5 * Math.sin(a.elapsed * 37)) : 1;
    e.audio.playSfx(o.type, {
      volume: ct[o.type],
      pan: i,
      rate: c
    });
  }
}
function Se(e, a) {
  ee(e, !1), e.deaths++, e.phase = "dead", e.deathTimer = 0.32, e.shake = 0.28, e.events.push({
    type: "death",
    x: e.player.x,
    y: e.player.y
  }), a.localSession.haptic("hard");
}
function lt(e, a) {
  let r = k[e.levelIndex];
  e.winTime = e.attemptTime, e.earnedStars = Y(r, e.winTime), ee(e, !0), e.replayDuration = e.winTime, e.replayTime = -0.5, e.phase = "replay", e.progress.best[r.id] = Math.min(e.progress.best[r.id] ?? 1 / 0, e.winTime), ue(a, e.progress), e.events.push({
    type: "win",
    x: e.player.x,
    y: e.player.y
  }), a.localSession.haptic("success");
}
function pt(e, a) {
  if (e.reported) return;
  e.reported = !0, e.phase = "complete", e.paused = !1, e.earnedStars > 0 ? ke(a) : a.audio.stopMusic(0.2);
  let r = Math.max(0, Math.min(3, e.earnedStars));
  a.gameOver(0, e.levelMode ? {
    levelIndex: e.currentLevelIndex,
    stars: r
  } : void 0);
}
function Ge(e, a, r, n) {
  if (e.reported || e.phase === "complete") return;
  let t = e.uiAction;
  if (e.uiAction = "", (t || r.pause) && e.events.push({
    type: "select",
    x: e.player.x,
    y: e.player.y
  }), (r.pause || t === "pause") && (e.paused = !e.paused), (t === "resume" || e.paused && r.confirm) && (e.paused = !1), t === "mute" && (e.musicMuted = !e.musicMuted), !e.paused) {
    if (e.phase === "replay") {
      (Te(e, n) || e.replayTime > 1 && (r.confirm || t === "skip")) && pt(e, a);
      return;
    }
    if (e.phase === "dead") {
      e.deathTimer -= n, e.deathTimer <= 0 && (e.player = A(k[e.levelIndex].spawn), e.phase = "ready", e.attemptTime = 0, e.recordClock = 0, e.started = !1, e.events.push({
        type: "respawn",
        x: e.player.x,
        y: e.player.y
      }));
      return;
    }
    if (r.retry || t === "retry") {
      e.started && Se(e, a);
      return;
    }
    e.phase === "ready" && (r.move || r.jumpPressed || r.confirm || t === "start") && (e.phase = "playing", e.started = !0, Q(e, 1 / 60)), e.phase === "playing" && (e.elapsed += n, e.attemptTime += n, Me(e, k[e.levelIndex], r, n), Q(e, n), be(e, k[e.levelIndex]) ? Se(e, a) : ve(e, k[e.levelIndex]) && lt(e, a));
  }
}
var B = 420,
  F = [[0, 0.2], [-0.31, -0.1], [0.31, -0.1], [-0.16, -0.34], [0.16, -0.34], [0, 0.4], [0, 0.65], [0, -0.13], [-0.43, -0.13], [-0.65, -0.18]];
function Ce(e, a) {
  let r = e.particleCursor++ % B;
  e.particles[r] ? Object.assign(e.particles[r], a) : e.particles[r] = a;
}
function Pe(e, a, r, n, t) {
  for (let o = 0; o < F.length; o++) {
    let [i, s] = F[o],
      c = o * 2.399963 + 0.6;
    Ce(e, {
      x: a + i,
      y: r + s,
      vx: Math.cos(c) * (3.5 + o % 3) + n * 0.22,
      vy: 4 + Math.sin(c) * 4 + Math.max(-2, t * 0.12),
      life: 0.85,
      maxLife: 0.85,
      size: 1,
      kind: 10 + o,
      angle: 0,
      spin: (o % 2 ? -1 : 1) * (4 + o % 4),
      surface: 0
    });
  }
  for (let o = 0; o < 44; o++) {
    let i = o * 2.399963 + e.presentationTime,
      s = 4 + o % 9;
    Ce(e, {
      x: a,
      y: r + 0.08,
      vx: Math.cos(i) * s + n * 0.3,
      vy: Math.sin(i) * s + 2,
      life: 1.15 + o % 4 * 0.12,
      maxLife: 1.51,
      size: 0.065 + o % 5 * 0.025,
      kind: o % 4 === 0 ? 4 : 3,
      angle: i,
      spin: 0,
      surface: 0
    });
  }
}
function Le(e, a) {
  if (e.paused) return;
  for (let n of e.events) n.type === "death" && Pe(e, n.x, n.y, e.player.vx, e.player.vy);
  if (e.phase === "replay") for (let n of e.attempts) {
    if (n.won || n.duration < e.replayTime - a || n.duration >= e.replayTime) continue;
    let t = n.frames[n.frames.length - 1];
    t && Pe(e, t.x, t.y, t.vx, t.vy);
  }
  let r = k[e.levelIndex];
  for (let n of e.particles) {
    if (n.kind < 3 || n.life <= 0) continue;
    let t = n;
    if (t.life = Math.max(0, t.life - a), t.surface) continue;
    let o = t.x,
      i = t.y;
    t.vy -= 19 * a, t.x += t.vx * a, t.y += t.vy * a, t.angle += t.spin * a, t.kind < 10 && (t.angle = Math.atan2(t.vy, t.vx));
    for (let s = 0; s < r.solids.length + r.hazards.length; s++) {
      let c = s < r.solids.length ? r.solids[s] : r.hazards[s - r.solids.length],
        p = 0;
      if (t.x >= c.x && t.x <= c.x + c.w && (i >= c.y + c.h && t.y <= c.y + c.h ? (t.y = c.y + c.h + 0.015, p = 1) : i <= c.y && t.y >= c.y && (t.y = c.y - 0.015, p = 1)), !p && t.y >= c.y && t.y <= c.y + c.h && (o <= c.x && t.x >= c.x ? (t.x = c.x - 0.015, p = 2) : o >= c.x + c.w && t.x <= c.x + c.w && (t.x = c.x + c.w + 0.015, p = 2)), !!p) {
        t.kind >= 10 ? (p === 1 ? t.vy = -t.vy * 0.28 : t.vx = -t.vx * 0.28, t.vx *= 0.65, t.spin *= 0.6) : (t.surface = p, t.angle = p === 1 ? 0 : Math.PI / 2, t.vx = t.vy = 0, t.life = t.maxLife = 2.4);
        break;
      }
    }
  }
}
function Ae(e, a) {
  Le(e, a);
  for (let r of e.events) {
    if (r.type === "death") continue;
    let n = r.type === "win" ? 38 : r.type === "step" ? 2 : r.type === "slide" ? 3 : 8;
    for (let t = 0; t < n; t++) {
      let o = t * 2.399963 + e.presentationTime * 4,
        i = 1 + t % 4,
        s = {
          x: r.x,
          y: r.y + 0.05,
          vx: Math.cos(o) * i,
          vy: Math.sin(o) * i + 1.5,
          life: r.type === "win" ? 0.65 : 0.3,
          maxLife: r.type === "win" ? 0.65 : 0.3,
          size: 0.06 + t % 3 * 0.025,
          kind: r.type === "win" ? 2 : 0
        },
        c = e.particleCursor++ % B;
      e.particles[c] ? Object.assign(e.particles[c], s) : e.particles[c] = s;
    }
  }
  for (let r of e.particles) r.life > 0 && r.kind < 3 && (r.life -= a, r.x += r.vx * a, r.y += r.vy * a, r.vy -= 12 * a);
  e.shake = Math.max(0, e.shake - a * 1.8);
}
import * as Oe from "./vendor/002-three.js";
import * as ze from "./vendor/002-three.js";
import * as v from "./vendor/002-three.js";
var N = new Map();
function Ie(e, a = 1) {
  let r = `${e}:${a}`,
    n = N.get(r);
  return n || (n = new v.MeshBasicMaterial({
    color: e,
    opacity: a,
    transparent: a < 1,
    depthWrite: a === 1,
    toneMapped: !1,
    side: v.DoubleSide
  }), N.set(r, n)), n;
}
var xt = new v.MeshBasicMaterial({
    vertexColors: !0,
    toneMapped: !1,
    side: v.DoubleSide
  }),
  q = new v.PlaneGeometry(1, 1);
q.userData.shared = !0;
var dt = new v.CircleGeometry(1, 32);
dt.userData.shared = !0;
var E = class {
    positions = [];
    colors = [];
    colorCache = new Map();
    tri(a, r, n, t) {
      let o = this.colorCache.get(t);
      o || (o = new v.Color(t), this.colorCache.set(t, o)), this.positions.push(...a, ...r, ...n);
      for (let i = 0; i < 3; i++) this.colors.push(o.r, o.g, o.b);
      return this;
    }
    rect(a, r, n, t, o, i = 0) {
      let s = [a, r, i],
        c = [a + n, r, i],
        p = [a + n, r + t, i],
        l = [a, r + t, i];
      return this.tri(s, c, p, o), this.tri(s, p, l, o), this;
    }
    poly(a, r, n = 0) {
      let t = a.map(i => new v.Vector2(i[0], i[1])),
        o = v.ShapeUtils.triangulateShape(t, []);
      for (let i of o) this.tri(...i.map(s => [a[s][0], a[s][1], n]), r);
      return this;
    }
    line(a, r, n, t, o, i, s = 0) {
      let c = Math.hypot(n - a, t - r) || 1,
        p = -(t - r) / c * o / 2,
        l = (n - a) / c * o / 2;
      return this.poly([[a + p, r + l], [n + p, t + l], [n - p, t - l], [a - p, r - l]], i, s);
    }
    disc(a, r, n, t, o = 0, i = 16) {
      for (let s = 0; s < i; s++) {
        let c = s * Math.PI * 2 / i,
          p = (s + 1) * Math.PI * 2 / i;
        this.tri([a, r, o], [a + Math.cos(c) * n, r + Math.sin(c) * n, o], [a + Math.cos(p) * n, r + Math.sin(p) * n, o], t);
      }
      return this;
    }
    mesh() {
      let a = new v.BufferGeometry();
      return a.setAttribute("position", new v.Float32BufferAttribute(this.positions, 3)), a.setAttribute("color", new v.Float32BufferAttribute(this.colors, 3)), a.computeBoundingSphere(), new v.Mesh(a, xt);
    }
  },
  ae;
function I(e, a, r, n, t = 0.3, o = -1) {
  if (!ae) {
    let p = document.createElement("canvas");
    p.width = p.height = 64;
    let l = p.getContext("2d"),
      d = l.createRadialGradient(32, 32, 1, 32, 32, 32);
    d.addColorStop(0, "#ffffff"), d.addColorStop(0.25, "#ffffff70"), d.addColorStop(1, "#ffffff00"), l.fillStyle = d, l.fillRect(0, 0, 64, 64), ae = new v.CanvasTexture(p);
  }
  let i = `glow:${n}:${t}`,
    s = N.get(i);
  s || (s = new v.MeshBasicMaterial({
    color: n,
    map: ae,
    transparent: !0,
    opacity: t,
    depthWrite: !1,
    blending: v.AdditiveBlending,
    toneMapped: !1
  }), N.set(i, s));
  let c = new v.Mesh(q, s);
  return c.position.set(e, a, o), c.scale.set(r, r, 1), c;
}
function y(e) {
  return Math.abs(Math.sin(e * 127.1 + 311.7) * 43758.5453) % 1;
}
function Be(e = {
  x: -3,
  y: -1,
  w: 6,
  h: 2
}, a = "forge") {
  let r = new ze.Group(),
    n = new E(),
    {
      x: t,
      y: o,
      w: i,
      h: s
    } = e,
    c = a === "quarry",
    p = c ? [4342348, 4737360, 4013127, 5263450] : [4800583, 5325642, 4339519, 5654347];
  n.rect(t - 0.07, o - 0.13, i + 0.14, s + 0.2, 1052440, -0.05), n.rect(t, o, i, s, 2696752, 0);
  let l = Math.ceil(s / 0.68),
    d = s > 1.8 ? 1.63 : 1.35;
  for (let h = 0; h < l; h++) {
    let x = o + h * 0.68,
      m = Math.min(0.62, o + s - x);
    if (!(m <= 0.035)) for (let u = -1; u < Math.ceil(i / d); u++) {
      let f = h % 2 * d * 0.48,
        M = y(u * 6 + h * 13 + o) * 0.16,
        g = Math.max(t + 0.055, t + u * d + f + M),
        R = Math.min(t + i - 0.055, t + u * d + f + d - 0.06) - g;
      if (R < 0.06) continue;
      let L = g * 7 + x * 13;
      if (n.rect(g, x + 0.03, R, m, p[Math.floor(y(L) * p.length)], 0.025), n.rect(g + 0.035, x + m - 0.015, Math.max(0.01, R - 0.07), 0.028, c ? 6842224 : 7627110, 0.03), n.rect(g + R - 0.06, x + 0.03, 0.05, m - 0.03, 3419189, 0.04), s > 1.8 && R > 0.3 && (n.poly([[g, x + m * 0.35], [g + 0.055, x + m * 0.67], [g + 0.15, x + m * 0.94], [g + 0.28, x + m], [g, x + m]], 3419190, 0.05), y(L + 77) > 0.5 && n.poly([[g + R - 0.23, x + 0.04], [g + R - 0.12, x + 0.14], [g + R, x + 0.21], [g + R, x + 0.04]], 3155763, 0.051)), R > 0.4 && y(L + 9) > 0.5) {
        let H = g + R * 0.6;
        n.line(H, x + m, H - 0.12, x + m * 0.55, 0.025, 2696238, 0.055), n.line(H - 0.12, x + m * 0.55, H + 0.08, x + m * 0.25, 0.022, 2696238, 0.055);
      }
    }
  }
  n.rect(t, o + s - 0.19, i, 0.19, 3158073, 0.1), n.rect(t, o + s - 0.035, i, 0.05, c ? 11578801 : 11968647, 0.12), n.rect(t, o + s - 0.09, i, 0.022, 6839132, 0.13);
  for (let h = 0.18; h < i; h += 0.85) n.disc(t + h, o + s - 0.135, 0.035, 1184539, 0.15, 8), n.disc(t + h - 0.008, o + s - 0.124, 0.017, 10193024, 0.16, 8);
  if (s > 1.1) for (let h of [t + 0.04, t + i - 0.23]) {
    n.rect(h, o + 0.08, 0.19, s - 0.29, 3420474, 0.07), n.rect(h, o + 0.08, 0.028, s - 0.29, 7692904, 0.08);
    for (let x = o + 0.35; x < o + s - 0.3; x += 0.8) n.disc(h + 0.11, x, 0.03, 9666679, 0.09, 8);
  }
  if (o > 2 && i < 12) {
    n.poly([[t + 0.08, o], [t + i * 0.23, o - 0.45], [t + i * 0.35, o - 0.4], [t + i * 0.49, o - 0.67], [t + i * 0.68, o - 0.26], [t + i - 0.05, o]], 2433581, -0.07), n.line(t + i * 0.15, o, t + i * 0.38, o - 0.36, 0.11, 4995905, -0.06);
    for (let h = 0; h < Math.ceil(i / 0.95); h++) {
      let x = t + h * 0.95,
        m = 0.08 + y(x * 5 + o) * 0.29,
        u = Math.min(0.93, t + i - x);
      n.poly([[x, o + 0.11], [x + u, o + 0.11], [x + u - 0.09, o - m * 0.6], [x + u * 0.47, o - m], [x + 0.08, o - m * 0.68]], 3813435, 0.015), n.poly([[x + 0.09, o], [x + u - 0.03, o + 0.05], [x + u - 0.09, o - m * 0.6], [x + u * 0.47, o - m]], 3090483, 0.022), n.line(x + 0.1, o, x + u - 0.06, o + 0.045, 0.032, 6508631, 0.03);
    }
  }
  return r.add(n.mesh()), r;
}
import * as De from "./vendor/002-three.js";
function mt(e, a, r, n, t, o, i) {
  let s = n / 2,
    c = r + t * 0.58,
    p = [[a - s, r], [a - s, c], [a - s * 0.76, c + t * 0.19], [a, r + t], [a + s * 0.76, c + t * 0.19], [a + s, c], [a + s, r]];
  e.poly(p, i ? 3486531 : 3352367, o);
  let l = [[a - s + 0.45, r], [a - s + 0.45, c - 0.1], [a - s * 0.68, c + t * 0.14], [a, r + t - 0.56], [a + s * 0.68, c + t * 0.14], [a + s - 0.45, c - 0.1], [a + s - 0.45, r]];
  e.poly(l, i ? 1383979 : 1513506, o + 0.01);
  for (let d of [-1, 1]) {
    e.rect(a + d * s - 0.21, r, 0.42, c - r, i ? 4341835 : 3943990, o + 0.04), e.rect(a + d * s - 0.07, r, 0.09, c - r, i ? 5591649 : 4995392, o + 0.05);
    for (let h = 0; h < 8; h++) {
      let x = h / 8,
        m = (h + 1) / 8,
        u = M => a + d * s * Math.pow(1 - M, 0.72),
        f = M => c + (r + t - c) * M;
      e.line(u(x), f(x), u(m), f(m), 0.4, h % 2 ? 4666428 : 3878455, o + 0.03), e.line(u(x), f(x), u(x) - d * 0.28, f(x) - 0.16, 0.038, 2170409, o + 0.06);
    }
    for (let h = r + 0.55; h < c; h += 0.85) e.rect(a + d * s - 0.23, h, 0.47, 0.045, 2169894, o + 0.07);
    e.rect(a + d * s - 0.38, c - 0.14, 0.76, 0.23, 5324874, o + 0.08), e.rect(a + d * s - 0.48, r, 0.96, 0.32, 4206908, o + 0.08);
  }
  e.disc(a, r + t * 0.72, 0.56, 857117, o + 0.03, 24), e.disc(a, r + t * 0.72, 0.41, i ? 3232608 : 6635570, o + 0.04, 24);
  for (let d = 0; d < 6; d++) {
    let h = d * Math.PI / 3;
    e.line(a, r + t * 0.72, a + Math.cos(h) * 0.44, r + t * 0.72 + Math.sin(h) * 0.44, 0.09, 1645350, o + 0.05);
  }
}
function je(e = {
  width: 34,
  height: 19.125,
  theme: "forge",
  solids: []
}) {
  let a = new De.Group(),
    r = new E(),
    n = e.width,
    t = e.height,
    o = e.theme === "quarry",
    i = e.theme === "belfry";
  r.rect(-60, -40, 150, 100, o ? 1383467 : 1578786, -18);
  for (let p = 0; p < 3; p++) {
    let l = [[-20, -20]];
    for (let d = -20; d <= n + 20; d += 1.9) l.push([d, 1.6 + y(d + p * 32) * (3.8 + p * 0.8)]);
    l.push([n + 20, -20]), r.poly(l, [2236460, 2695469, 3023662][p], -15 + p * 0.3);
  }
  for (let [p, l, d] of [[3.3, 8.7, t * 0.94], [17, 12.2, t * 1.12], [30.6, 8.7, t * 0.94]]) mt(r, p, -1, l, d, -11, o);
  for (let p of [10.7, 23.3]) {
    r.rect(p - 0.46, -2, 0.92, t + 5, 2367789, -9.5), r.rect(p - 0.3, -2, 0.17, t + 5, 4599866, -9.4), r.rect(p + 0.23, -2, 0.06, t + 5, 5783623, -9.3);
    for (let l = 0.5; l < t + 3; l += 1.75) r.rect(p - 0.55, l, 1.1, 0.14, 1579041, -9.2), r.rect(p - 0.5, l + 0.13, 1, 0.055, 5979203, -9.1), r.disc(p - 0.27, l + 0.065, 0.043, 10183248, -9, 8), r.disc(p + 0.27, l + 0.065, 0.043, 10183248, -9, 8);
  }
  let s = i ? 17 : 20.5;
  r.poly([[s - 1.25, 0], [s - 1.25, 12], [s - 0.72, 13.2], [s + 0.72, 13.2], [s + 1.25, 12], [s + 1.25, 0]], 3481385, -8.8), r.rect(s - 0.83, -1, 1.66, 12.7, o ? 3690070 : 7877411, -8.7);
  for (let p = 0; p < 10; p++) {
    let l = s - 0.77 + p * 0.158;
    r.rect(l, -1, 0.04 + y(p) * 0.05, 11.8 - y(p + 4) * 2, o ? 5399658 : p % 2 ? 12606252 : 9979428, -8.6);
  }
  r.rect(s - 1.08, 11.1, 2.16, 0.52, 3155504, -8.3), r.rect(s - 1.08, 11.58, 2.16, 0.055, 7889229, -8.2);
  for (let p = 0; p < 6; p++) r.disc(s - 0.85 + p * 0.34, 11.34, 0.045, 7885127, -8.1, 8);
  for (let p = 0; p < e.solids.length; p++) {
    let l = e.solids[p];
    if (l.y < 3 || l.h > 2 || l.w > 12) continue;
    let d = l.x + l.w * 0.17;
    r.line(d, l.y, d + 0.1, t + 4, 0.045, 4338234, -2.2), r.line(l.x + l.w * 0.87, l.y, l.x + l.w * 0.84, t + 4, 0.045, 4338234, -2.2);
    for (let h = l.y + 0.2; h < t + 2; h += 0.27) r.rect(d - 0.055, h, 0.11, 0.075, 5915208, -2.1), r.rect(l.x + l.w * 0.86 - 0.04, h, 0.08, 0.06, 5060930, -2.1);
    r.poly([[l.x + 0.3, l.y], [l.x + l.w * 0.4, l.y - 1], [l.x + l.w * 0.48, l.y - 0.94], [l.x + 0.5, l.y]], 2696496, -2), r.poly([[l.x + l.w - 0.3, l.y], [l.x + l.w * 0.6, l.y - 1], [l.x + l.w * 0.52, l.y - 0.94], [l.x + l.w - 0.5, l.y]], 2696496, -2);
  }
  for (let p = 0; p < 9; p++) {
    let l = p * 4.3 - 1,
      d = 0.9 + y(p * 3) * 2.2;
    r.rect(l, d, 1.5, 2.15, 2827567, -6), r.poly([[l - 0.13, d + 2.15], [l + 0.75, d + 2.8], [l + 1.63, d + 2.15]], 3484212, -5.9), r.rect(l + 0.22, d + 0.48, 1.06, 1.25, o ? 3689555 : 7025706, -5.8);
    for (let h = 0; h < 4; h++) r.rect(l + 0.26 + h * 0.27, d + 0.46, 0.065, 1.3, 1908264, -5.7);
    r.rect(l + 0.19, d + 1.12, 1.1, 0.09, 2629674, -5.6);
  }
  let c = [[-20, t + 14], [-20, t + 0.8]];
  for (let p = -20; p < n + 20; p += 1.1) c.push([p, t + 1.1 - y(p * 9) * 1.4]);
  return c.push([n + 20, t + 14]), r.poly(c, 987417, 2.8), a.add(r.mesh()), a.add(I(n * 0.58, 3.4, 20, o ? 6392214 : 14840119, 0.17, -7.5)), a.add(I(n * 0.14, t * 0.7, 13, 7898777, 0.055, -7.4)), a;
}
import * as re from "./vendor/002-three.js";
function Fe(e = {
  x: 0,
  y: 0,
  r: 1.2
}) {
  let a = new re.Group(),
    r = new E(),
    n = new re.Group(),
    t = e.range ?? 0,
    o = e.axis === "y",
    i = e.x - (o ? 0 : t),
    s = e.y - (o ? t : 0),
    c = e.x + (o ? 0 : t),
    p = e.y + (o ? t : 0);
  if (t > 0) {
    r.line(i, s, c, p, 0.2, 1119518, 0.3), r.line(i, s + 0.055, c, p + 0.055, 0.045, 6840682, 0.31);
    for (let [x, m] of [[i, s], [c, p]]) r.rect(x - 0.25, m - 0.27, 0.5, 0.54, 2237743, 0.32), r.rect(x - 0.21, m + 0.18, 0.42, 0.055, 9207417, 0.33), r.disc(x, m, 0.115, 7627358, 0.34, 12), r.disc(x, m, 0.049, 1775907, 0.35, 8);
  } else {
    let x = e.x + e.r * 0.55,
      m = e.y - e.r * 1.4;
    if (r.line(e.x, e.y, x, m, 0.19, 3420733, 0.22), r.line(e.x + 0.035, e.y, x + 0.035, m, 0.035, 7101536, 0.23), e.r > 1.1) {
      r.rect(x - 0.46, m - 0.45, 0.92, 0.9, 2105643, 0.24), r.rect(x - 0.42, m + 0.32, 0.84, 0.07, 7430506, 0.25), r.line(e.x - e.r * 0.7, e.y - e.r * 0.6, x, m, 0.11, 4536385, 0.21), r.disc(x, m, 0.23, 7365477, 0.26, 12), r.disc(x, m, 0.11, 2433581, 0.27, 8);
      for (let u of [-0.31, 0.31]) for (let f of [-0.29, 0.29]) r.disc(x + u, m + f, 0.04, 9601402, 0.28, 8);
    }
  }
  a.add(r.mesh());
  let l = new E(),
    d = 24;
  l.disc(0, 0, 0.83, 1382691, 0.8, 48);
  for (let x = 0; x < d; x++) {
    let m = x * Math.PI * 2 / d,
      u = (f, M) => [Math.cos(f) * M, Math.sin(f) * M];
    l.poly([u(m, 0.74), u(m + 0.055, 1), u(m + 0.2, 0.82), u(m + 0.25, 0.73)], 9608613, 0.86), l.poly([u(m + 0.055, 1), u(m + 0.1, 0.86), u(m + 0.2, 0.82)], 14409946, 0.875);
  }
  l.disc(0, 0, 0.76, 6384503, 0.88, 48), l.disc(-0.018, 0.018, 0.64, 8950168, 0.89, 48), l.disc(0, 0, 0.59, 7239811, 0.9, 48);
  for (let x = 0; x < 6; x++) {
    let m = x * Math.PI / 3,
      u = Math.cos(m),
      f = Math.sin(m);
    l.line(u * 0.29, f * 0.29, u * 0.49, f * 0.49, 0.09, 4015442, 0.92), l.disc(u * 0.54, f * 0.54, 0.021, 12502469, 0.94, 8);
  }
  l.disc(0, 0, 0.235, 2698039, 0.96, 24), l.disc(0, 0, 0.175, 13209433, 0.97, 12), l.disc(0, 0, 0.1, 2434609, 0.98, 8), l.disc(-0.035, 0.035, 0.038, 15252603, 0.99, 8), n.add(l.mesh()), n.scale.setScalar(e.r), a.add(n);
  let h = x => {
    let m = Math.sin(x * (e.speed ?? 1) + (e.phase ?? 0)) * t;
    n.position.set(e.x + (o ? 0 : m), e.y + (o ? m : 0), 0), n.rotation.z = -x * 5.6;
  };
  return h(0), {
    group: a,
    update: h
  };
}
import * as oe from "./vendor/002-three.js";
function Ve(e = {
  x: -0.7,
  y: -1,
  w: 1.4,
  h: 2
}) {
  let a = new oe.Group(),
    r = new E(),
    n = e.x + e.w / 2,
    t = e.y,
    o = e.w,
    i = e.h;
  r.rect(n - o * 0.58, t - 0.09, o * 1.16, 0.18, 3289404, 0.7), r.rect(n - o * 0.48, t + 0.03, o * 0.96, 0.06, 10156765, 0.8);
  for (let d of [-1, 1]) r.rect(n + d * o * 0.49 - 0.07, t + 0.08, 0.14, i * 0.78, 5861739, 0.6), r.rect(n + d * o * 0.49 - 0.025, t + 0.1, 0.05, i * 0.77, 12639168, 0.65), r.line(n + d * o * 0.49, t + i * 0.8, n, t + i + 0.18, 0.13, 7048828, 0.6), r.line(n + d * o * 0.49, t + i * 0.8, n, t + i + 0.18, 0.042, 11466968, 0.66);
  r.disc(n, t + i + 0.18, 0.12, 14745559, 0.69, 4), r.rect(n - 0.19, t + 0.1, 0.38, 0.09, 7453088, 0.71), a.add(r.mesh(), I(n, t + i * 0.5, 4.3, 4912562, 0.23, 0.2));
  let s = new oe.Group(),
    c = new E();
  c.poly([[0, 0.45], [0.2, 0.03], [0, -0.32], [-0.2, 0.03]], 5167537, 1), c.poly([[0, 0.45], [0, -0.32], [-0.2, 0.03]], 13107176, 1.02), c.poly([[0, 0.45], [0.08, 0.04], [0, -0.32]], 8911579, 1.04), s.add(c.mesh()), s.position.set(n, t + i * 0.53, 0), a.add(s);
  let p = new E();
  for (let d = 0; d < 6; d++) {
    let h = d * Math.PI / 3;
    p.disc(Math.cos(h) * o * 0.3, Math.sin(h) * i * 0.35, 0.025, 13893596, 1.2, 4);
  }
  let l = p.mesh();
  return l.position.set(n, t + i * 0.53, 0), a.add(l), {
    group: a,
    update(d) {
      s.position.y = t + i * 0.53 + Math.sin(d * 2.2) * 0.1, l.rotation.z = d * 0.35;
    }
  };
}
import * as K from "./vendor/002-three.js";
function Ye(e = {
  x: -5,
  y: -1,
  w: 10,
  h: 1
}) {
  let a = new K.Group(),
    r = new E(),
    n = e.y + e.h;
  r.rect(e.x, e.y - 4, e.w, e.h + 4, 10034722, 0.3), r.rect(e.x, n - 0.43, e.w, 0.43, 16205340, 0.31), r.rect(e.x, n - 0.16, e.w, 0.16, 16742952, 0.32), r.rect(e.x, n - 0.047, e.w, 0.047, 16766059, 0.33);
  for (let i = 0; i < e.w * 4; i++) {
    let s = e.x + y(i * 8.21) * e.w,
      c = n - 0.1 - y(i * 17.6) * 0.64;
    r.rect(s, c, 0.08 + y(i + 9) * 0.73, 0.015 + y(i) * 0.02, i % 3 ? 16751665 : 16765296, 0.34);
  }
  let t = [[e.x - 1, e.y - 5]];
  for (let i = 0; i <= Math.ceil(e.w / 0.7); i++) t.push([e.x + i * 0.7, n - 0.85 - y(i * 3.7) * 0.7]);
  t.push([e.x + e.w + 1, e.y - 5]), r.poly(t, 2366248, 2.6);
  for (let i = 0; i < e.w / 2; i++) {
    let s = e.x + i * 2,
      c = 0.65 + y(i * 3) * 0.65,
      p = n - 0.72 - y(i + 9) * 0.7;
    r.poly([[s - 0.7, p - 0.95], [s - 0.72, p - 0.32], [s - 0.21, p + 0.06], [s + 0.18, p], [s + c, p - 0.42], [s + c, p - 0.95]], 3416877, 2.61), r.poly([[s - 0.72, p - 0.32], [s - 0.21, p + 0.06], [s + 0.18, p], [s + 0.07, p - 0.32]], 5320757, 2.62), r.line(s - 0.21, p + 0.06, s + 0.18, p, 0.034, 8077366, 2.63);
  }
  for (let i = 0; i < e.w / 2.6; i++) {
    let s = e.x + y(i + 113) * e.w,
      c = n - 0.2 - y(i + 131) * 0.32;
    r.poly([[s, c], [s + 0.47, c + 0.025], [s + 0.76, c - 0.08], [s + 0.2, c - 0.11]], 7087653, 0.36), r.line(s, c, s + 0.47, c + 0.025, 0.018, 16759875, 0.37);
  }
  a.add(r.mesh());
  for (let i = 0; i < Math.ceil(e.w / 7); i++) a.add(I(e.x + (i + 0.5) * 7, n, 11, 16404508, 0.36, 0.1));
  let o = [];
  for (let i = 0; i < 34; i++) {
    let s = new K.Mesh(q, Ie(i % 3 ? 16749621 : 16768910, 0.7)),
      c = 0.025 + y(i + 67) * 0.035;
    s.scale.set(c, c * 1.8, 1), a.add(s), o.push(s);
  }
  return {
    group: a,
    update(i) {
      for (let s = 0; s < o.length; s++) {
        let c = (i * (0.11 + y(s) * 0.15) + y(s + 42)) % 1;
        o[s].position.set(e.x + y(s + 70) * e.w + Math.sin(i + s) * 0.21, n + c * (1.4 + y(s + 20) * 2.8), 1.7), o[s].visible = c < 0.86;
      }
    }
  };
}
import * as We from "./vendor/002-three.js";
function O(e, a, r, n, t, o, i, s) {
  let p = [];
  for (let d = 0; d < 9; d++) {
    let h = d / 9 * Math.PI * 2,
      x = 0.76 + y(o + d * 4.7) * 0.3;
    p.push([a + Math.cos(h) * n * x, r + Math.sin(h) * t * x]);
  }
  let l = s ? [3681335, 4272185, 4535099, 4009528] : [2367533, 2893106, 3155763, 2695982];
  e.poly(p, l[Math.floor(y(o + 7) * 4)], i);
  for (let d = 0; d < 9; d++) {
    let h = p[d],
      x = p[(d + 1) % 9];
    d < 4 && e.line(h[0], h[1], x[0], x[1], 0.035 + y(o + d) * 0.028, s ? 5914694 : 4141117, i + 0.008), d % 3 === 0 && e.poly([[a - n * 0.08, r + t * 0.18], h, x], s ? 4666430 : 3155765, i + 0.005);
  }
  e.line(a - n * 0.53, r - t * 0.11, a + n * 0.39, r + t * 0.02, 0.025, s ? 2892846 : 2039338, i + 0.012), e.line(a - n * 0.13, r + t * 0.3, a + n * 0.13, r - t * 0.24, 0.025, s ? 2892846 : 2039338, i + 0.012);
  for (let d = 0; d < 6; d++) {
    let h = a + (y(o + d * 13) - 0.5) * n * 1.36,
      x = r + (y(o + d * 9) - 0.5) * t * 1.3,
      m = 0.035 + y(o + d * 7) * 0.11;
    e.poly([[h - m, x], [h - m * 0.3, x + m * 0.66], [h + m, x + m * 0.35], [h + m * 0.74, x - m * 0.7], [h - m * 0.56, x - m * 0.4]], s ? 4995393 : 3418935, i + 0.016), e.line(h - m * 0.3, x + m * 0.66, h + m, x + m * 0.35, 0.018, s ? 6637643 : 4797247, i + 0.02);
  }
}
function Ne(e = 34, a = 19.125) {
  let r = new We.Group(),
    n = new E();
  for (let t of [-1, 1]) {
    for (let o = 0; o < 13; o++) {
      let i = 1 + o * 1.58,
        s = t < 0 ? -0.9 + y(o + 14) * 2.3 : e + 0.5 - y(o + 41) * 2.3;
      O(n, s, i, 1.7 + y(o + 83) * 1.7, 1.45 + y(o + 96) * 0.8, o + t * 94, -9.7, !0);
    }
    for (let o = 0; o < 6; o++) {
      let i = t < 0 ? 2.5 + o * 0.78 : e - 2.5 - o * 0.78,
        s = a + 0.8 - y(o + 31) * 1.8;
      O(n, i, s, 1.4, 1.45, o + t * 131, -9.6, !1);
    }
  }
  for (let t = 0; t < 12; t++) {
    let o = 3 + t * 2.8,
      i = 1.1 + y(t + 106) * 1.7;
    O(n, o, i, 1.5 + y(t + 101), 0.9 + y(t + 93), t * 6.3, -6.4, !0);
  }
  for (let t = 0; t < 5; t++) O(n, 14.1 + y(t + 8) * 0.6, a - t * 1.1, 1.15 + y(t + 18) * 0.7, 0.95, t * 19, -10.2, !1);
  return r.add(n.mesh()), r;
}
import * as ne from "./vendor/002-three.js";
function qe(e = 0, a = 0) {
  let r = new ne.Group(),
    n = new E();
  n.line(e, a - 0.25, e - 0.5, a - 0.7, 0.14, 2433579, -1.5), n.rect(e - 0.55, a - 0.88, 0.14, 0.65, 3748412, -1.45), n.poly([[e - 0.39, a], [e + 0.39, a], [e + 0.23, a - 0.32], [e - 0.23, a - 0.32]], 3156017, -1.3), n.line(e - 0.38, a, e + 0.38, a, 0.085, 10843980, -1.25);
  for (let o = 0; o < 3; o++) n.disc(e - 0.2 + o * 0.2, a - 0.14, 0.03, 10054220, -1.2, 8);
  r.add(n.mesh(), I(e, a + 0.2, 4.2, 16026434, 0.21, -1.8));
  let t = [];
  for (let o = 0; o < 3; o++) {
    let i = new ne.Group(),
      s = new E(),
      c = (o - 1) * 0.16;
    s.poly([[-0.13, 0], [-0.2, 0.22], [-0.04, 0.41], [0.07, 0.79], [0.12, 0.4], [0.2, 0.22], [0.13, 0]], 15362857, -1.1), s.poly([[-0.08, 0], [-0.1, 0.23], [0.04, 0.49], [0.08, 0.22], [0.1, 0]], 16762210, -1.05), s.poly([[-0.04, 0], [0, 0.21], [0.05, 0]], 16770208, -1), i.add(s.mesh()), i.position.set(e + c, a + 0.015, 0), r.add(i), t.push(i);
  }
  return {
    group: r,
    update(o) {
      for (let i = 0; i < t.length; i++) t[i].scale.set(0.72 + Math.sin(o * 9 + i * 5) * 0.14, 0.69 + Math.sin(o * 7.6 + i * 2.7) * 0.2, 1), t[i].rotation.z = Math.sin(o * 4.2 + i * 2.8) * 0.13;
    }
  };
}
import * as se from "./vendor/002-three.js";
function Ke(e = {
  x: -3,
  y: -1.5,
  w: 6,
  h: 3
}) {
  let a = new se.Group(),
    r = new E(),
    {
      x: n,
      y: t,
      w: o,
      h: i
    } = e;
  if (o < 3 || i < 1.8) return {
    group: a,
    update(x) {}
  };
  let s = n + 0.46,
    c = t + 0.34,
    p = o - 0.92,
    l = Math.min(i - 0.73, 1.55);
  r.poly([[s, c + 0.12], [s + 0.12, c], [s + p - 0.14, c], [s + p, c + 0.14], [s + p, c + l], [s, c + l]], 1316127, 0.18), r.rect(s + 0.1, c + 0.12, p - 0.2, l - 0.24, 2171179, 0.19), r.rect(s + 0.1, c + l - 0.17, p - 0.2, 0.075, 856089, 0.2);
  for (let x = 0; x < Math.floor(p / 0.72); x++) {
    let m = s + 0.28 + x * 0.72;
    r.rect(m, c + 0.18, 0.38, l - 0.37, y(m + 2) > 0.65 ? 3418417 : 1579813, 0.205), r.rect(m, c + 0.18, 0.038, l - 0.37, 3878970, 0.21);
  }
  let d = [];
  for (let x = 0; x < 2; x++) {
    let m = new se.Group(),
      u = new E(),
      f = (x ? 0.32 : 0.49) * Math.min(1, l / 1.35);
    for (let M = 0; M < 18; M++) {
      let g = M * Math.PI / 9,
        R = (L, H) => [Math.cos(L) * H, Math.sin(L) * H];
      u.poly([R(g, f * 0.77), R(g + 0.02, f), R(g + 0.15, f), R(g + 0.21, f * 0.77)], 6640210, 0.235);
    }
    u.disc(0, 0, f * 0.78, 5589328, 0.24, 32), u.disc(0, 0, f * 0.62, 2960438, 0.245, 32);
    for (let M = 0; M < 5; M++) {
      let g = M * Math.PI * 2 / 5;
      u.line(Math.cos(g) * f * 0.14, Math.sin(g) * f * 0.14, Math.cos(g) * f * 0.65, Math.sin(g) * f * 0.65, f * 0.15, 7033679, 0.25);
    }
    u.disc(0, 0, f * 0.21, 11501913, 0.26, 12), u.disc(0, 0, f * 0.1, 2499888, 0.27, 8), m.add(u.mesh()), m.position.set(s + p * (x ? 0.64 : 0.43), c + l * 0.54, 0), a.add(m), d.push(m);
  }
  r.rect(s - 0.06, c - 0.07, p + 0.12, 0.11, 5522507, 0.3), r.rect(s - 0.06, c + l - 0.03, p + 0.12, 0.14, 3945535, 0.3), r.rect(s - 0.06, c + l + 0.08, p + 0.12, 0.028, 9466472, 0.31);
  let h = c + l * 0.43;
  r.rect(s - 0.09, h, p + 0.18, 0.14, 4077378, 0.32), r.rect(s - 0.09, h + 0.12, p + 0.18, 0.028, 8218723, 0.33);
  for (let x = 0; x <= Math.floor(p / 0.46); x++) {
    let m = s + x * 0.46;
    r.disc(m, h + 0.068, 0.027, 1645349, 0.34, 8), r.disc(m, c + l + 0.025, 0.025, 9928811, 0.34, 8);
  }
  for (let x of [-1, 1]) {
    let m = x < 0 ? n + 0.01 : n + o - 0.33;
    r.poly([[m, t + 0.1], [m + 0.3, t + 0.18], [m + 0.33, t + i - 0.2], [m + 0.1, t + i - 0.29], [m + 0.04, t + i * 0.59]], 5324872, 0.27), r.line(m + 0.05, t + i * 0.6, m + 0.27, t + i * 0.68, 0.025, 9662826, 0.28), r.line(m + 0.03, t + i * 0.55, m + 0.28, t + i * 0.61, 0.035, 2367275, 0.29);
  }
  if (t > 0.5 && t < 6) for (let x of [-1, 1]) {
    let m = n + o * (x < 0 ? 0.16 : 0.84),
      u = m + x * 0.45,
      f = 0.2;
    r.line(m, t, u, f, 0.27, 2565169, -0.6), r.line(m - 0.07, t, u - 0.07, f, 0.052, 4665403, -0.59), r.line(m, t - 0.35, n + o * 0.5, Math.max(f, t - 2.1), 0.14, 2368304, -0.62);
    for (let M = f + 0.32; M < t - 0.2; M += 0.85) r.rect(u - 0.18, M, 0.36, 0.09, 3353142, -0.57);
  }
  return a.add(r.mesh()), {
    group: a,
    update(x) {
      d.forEach((m, u) => m.rotation.z = x * (u ? 0.8 : -0.5));
    }
  };
}
var ht = {
  id: "gallery",
  name: "Furnace Vault",
  subtitle: "",
  theme: "forge",
  width: 34,
  height: 19.125,
  spawn: {
    x: 2.5,
    y: 3.4
  },
  goal: {
    x: 27.5,
    y: 6,
    w: 1.65,
    h: 2.3
  },
  gold: 12,
  silver: 20,
  solids: [{
    x: 0,
    y: 0,
    w: 8,
    h: 3
  }, {
    x: 10,
    y: 3,
    w: 6,
    h: 1
  }, {
    x: 18,
    y: 4,
    w: 6,
    h: 1
  }, {
    x: 26,
    y: 5,
    w: 8,
    h: 1
  }],
  saws: [{
    x: 13,
    y: 4.85,
    r: 0.85,
    axis: "x",
    range: 1
  }, {
    x: 21,
    y: 5.85,
    r: 0.85
  }],
  hazards: [{
    x: -1,
    y: -1,
    w: 36,
    h: 1.65
  }]
};
function ie(e = ht) {
  let a = new Oe.Group(),
    r = [],
    n = [];
  a.add(je(e)), a.add(Ne(e.width, e.height));
  for (let [c, p] of [[10.7, 8.2], [23.3, 12.7], [1.1, 6.5]]) {
    let l = qe(c, p);
    a.add(l.group), r.push(l);
  }
  for (let c of e.solids) if (a.add(Be(c, e.theme)), c.h >= 1.8 && c.w >= 3) {
    let p = Ke(c);
    a.add(p.group), r.push(p);
  }
  for (let c of e.hazards) {
    let p = Ye(c);
    a.add(p.group), r.push(p);
  }
  for (let c of e.saws) {
    let p = Fe(c);
    a.add(p.group), n.push(p);
  }
  let t = Ve(e.goal);
  a.add(t.group), r.push(t);
  let o = new E(),
    i = e.spawn.x,
    s = e.spawn.y - 0.4;
  o.rect(i - 0.5, s - 0.006, 1, 0.045, 14523219, 0.4);
  for (let c of [-1, 1]) o.line(i + c * 0.65, s + 0.24, i + c * 0.8, s + 0.12, 0.055, 13739889, 0.5), o.line(i + c * 0.8, s + 0.12, i + c * 0.65, s, 0.055, 13739889, 0.5);
  return a.add(o.mesh()), {
    group: a,
    update(c, p = c) {
      for (let l of n) l.update(c);
      for (let l of r) l.update(p);
    },
    dispose() {
      let c = new Set();
      a.traverse(p => {
        let l = p;
        l.geometry && !l.geometry.userData.shared && !c.has(l.geometry) && (l.geometry.dispose(), c.add(l.geometry));
      }), a.clear();
    }
  };
}
import * as b from "./vendor/002-three.js";
var ut = new b.BoxGeometry(1, 1, 1),
  $e = new b.MeshBasicMaterial({
    color: 6743492
  }),
  Xe = new b.MeshBasicMaterial({
    color: 1392194
  }),
  yt = new b.MeshBasicMaterial({
    color: 1123627
  }),
  $ = new b.MeshBasicMaterial({
    color: 16741981
  }),
  ft = new b.MeshBasicMaterial({
    color: 16766074
  }),
  ce = new b.MeshBasicMaterial({
    color: 131853,
    toneMapped: !1
  }),
  wt = new b.MeshBasicMaterial({
    color: 16777215,
    toneMapped: !1
  });
function _e(e) {
  let a = new b.Shape(),
    r = (o, i) => a.moveTo((o - 194) / 500, 0.52 - (i - 77) / 500),
    n = (o, i) => a.lineTo((o - 194) / 500, 0.52 - (i - 77) / 500),
    t = (o, i, s, c) => a.quadraticCurveTo((o - 194) / 500, 0.52 - (i - 77) / 500, (s - 194) / 500, 0.52 - (c - 77) / 500);
  return e ? (r(64, 93), n(122, 93), t(129, 93, 129, 100), n(129, 164), t(129, 171, 136, 171), n(251, 171), t(258, 171, 258, 164), n(258, 100), t(258, 93, 265, 93), n(323, 93), t(330, 93, 330, 100), n(330, 306), t(330, 323, 313, 323), n(74, 323), t(57, 323, 57, 306), n(57, 100), t(57, 93, 64, 93)) : (r(54, 77), n(132, 77), t(145, 77, 145, 91), n(145, 151), t(145, 155, 149, 155), n(238, 155), t(242, 155, 242, 151), n(242, 91), t(242, 77, 255, 77), n(333, 77), t(347, 77, 347, 91), n(347, 315), t(347, 332, 334, 340), n(266, 378), t(260, 382, 250, 382), n(137, 382), t(127, 382, 121, 378), n(53, 340), t(40, 332, 40, 315), n(40, 91), t(40, 77, 54, 77)), a.closePath(), a;
}
function gt() {
  let e = new b.ExtrudeGeometry(_e(!1), {
      depth: 0.1,
      steps: 1,
      bevelEnabled: !1,
      curveSegments: 2
    }),
    a = e.getAttribute("position"),
    r = [],
    n = [],
    t = new Map();
  for (let i = 0; i < a.count; i++) {
    let s = a.getX(i),
      c = a.getY(i),
      p = a.getZ(i),
      l = `${s},${c},${p}`,
      d = t.get(l);
    d === void 0 && (d = r.length / 3, t.set(l, d), r.push(s, c, p)), n.push(d);
  }
  let o = new b.BufferGeometry();
  return o.setAttribute("position", new b.Float32BufferAttribute(r, 3)), o.setIndex(n), e.dispose(), o;
}
var bt = gt(),
  vt = new b.ShapeGeometry(_e(!0), 2),
  X = new b.Shape();
X.moveTo(0, 0.45);
X.bezierCurveTo(-0.24, 0.12, -0.15, -0.07, 0, -0.1);
X.bezierCurveTo(0.2, -0.03, 0.19, 0.12, 0, 0.45);
var Je = new b.ShapeGeometry(X);
function P(e, a, r, n, t, o, i, s) {
  let c = new b.Mesh(ut, s);
  return c.position.set(a, r, n), c.scale.set(t, o, i), e.add(c), c;
}
function j() {
  let e = new b.Group(),
    a = new b.Group();
  e.add(a);
  let r = new b.Mesh(bt, ce);
  r.position.z = 0.14, a.add(r);
  let n = new b.Mesh(vt, wt);
  n.position.z = 0.241, a.add(n), P(a, -0.098, 0.19, 0.25, 0.064, 0.126, 0.012, ce), P(a, 0.096, 0.19, 0.25, 0.064, 0.126, 0.012, ce), P(a, -0.31, -0.1, 0, 0.11, 0.19, 0.2, $e), P(a, 0.31, -0.1, 0, 0.11, 0.19, 0.2, $e);
  let t = P(a, -0.16, -0.34, 0.03, 0.19, 0.13, 0.3, Xe),
    o = P(a, 0.16, -0.34, 0.03, 0.19, 0.13, 0.3, Xe);
  P(a, 0, 0.4, 0, 0.07, 0.13, 0.12, yt);
  let i = new b.Mesh(Je, $);
  i.position.set(0, 0.48, 0.04), a.add(i);
  let s = new b.Mesh(Je, ft);
  s.scale.set(0.42, 0.58, 1), s.position.z = 0.01, i.add(s), P(a, 0, -0.13, 0.28, 0.55, 0.095, 0.05, $);
  let c = P(a, -0.43, -0.13, -0.03, 0.38, 0.105, 0.045, $),
    p = P(a, -0.65, -0.18, -0.03, 0.16, 0.11, 0.045, $);
  return {
    group: e,
    update(l, d, h = !1) {
      e.visible = !h, e.position.set(l.x, l.y, 2), a.rotation.z = l.wall ? -0.055 * l.wall : -0.05 * Math.max(-1, Math.min(1, l.vx / 8));
      let x = -l.squash || (l.grounded ? 0 : Math.min(0.13, Math.abs(l.vy) * 0.01));
      a.scale.set(1 - x * 0.45, 1 + x, 1), t.position.y = -0.34 + (l.grounded ? Math.sin(d * 38) * Math.min(0.08, Math.abs(l.vx) * 0.012) : 0.03), o.position.y = -0.34 - (l.grounded ? Math.sin(d * 38) * Math.min(0.08, Math.abs(l.vx) * 0.012) : -0.03), c.position.x = -l.facing * 0.43, p.position.x = -l.facing * 0.65, c.rotation.z = Math.sin(d * 14) * 0.15 + l.vy * 0.012, p.position.y = -0.16 + Math.sin(d * 16) * 0.05, i.scale.set(1 + Math.sin(d * 17) * 0.1, 1 + Math.sin(d * 12) * 0.08, 1), i.rotation.z = -0.1 * l.facing - l.vx * 0.025;
    }
  };
}
import * as Ue from "./vendor/002-three.js";
function le(e = 32) {
  let a = new Ue.Group(),
    r = Array.from({
      length: e
    }, () => j()),
    n = A();
  return r.forEach((t, o) => {
    t.group.visible = o === 0, a.add(t.group);
  }), {
    group: a,
    capacity: e,
    update(t) {
      let o = 0;
      if (t.phase === "replay") for (let i = 0; i < t.attempts.length - 1 && o < e; i++) {
        let s = te(t.attempts[i], t.replayTime);
        s && (Object.assign(n, s, {
          grounded: Math.abs(s.vy) < 0.05 && s.wall === 0
        }), r[o++].update(n, t.presentationTime));
      }
      for (; o < e; o++) r[o].group.visible = !1;
    },
    dispose() {
      a.clear();
    }
  };
}
import * as G from "./vendor/002-three.js";
import * as C from "./vendor/002-three.js";
function Ze() {
  let e = new C.Group(),
    a = j();
  a.update(A({
    x: 0,
    y: 0
  }), 0), a.group.position.set(0, 0, 0), a.group.updateMatrixWorld(!0);
  let n = a.group.children[0].children.map((s, c) => {
      let p = c < 4 ? 0 : c - 3,
        [l, d] = F[p],
        h = [];
      return s.traverse(x => {
        if (!(x instanceof C.Mesh)) return;
        let m = new C.InstancedMesh(x.geometry, x.material, B);
        m.frustumCulled = !1, m.count = 0, e.add(m);
        let u = new C.Matrix4().makeTranslation(-l, -d, 0).multiply(x.matrixWorld);
        h.push({
          mesh: m,
          local: u
        });
      }), {
        index: p,
        meshes: h
      };
    }),
    t = new C.Object3D(),
    o = new C.Matrix4();
  function i(s) {
    for (let c of n) {
      let p = 0;
      for (let l of s.particles) {
        if (l.life <= 0 || l.kind !== 10 + c.index) continue;
        let d = l;
        t.position.set(d.x, d.y, 2.25), t.rotation.z = d.angle, t.scale.setScalar(Math.min(1, d.life / 0.22)), t.updateMatrix();
        for (let {
          mesh: h,
          local: x
        } of c.meshes) h.setMatrixAt(p, o.multiplyMatrices(t.matrix, x));
        p++;
      }
      for (let {
        mesh: l
      } of c.meshes) l.count = p, l.instanceMatrix.needsUpdate = !0;
    }
  }
  return i({
    particles: F.map(([s, c], p) => ({
      x: s * 2.4,
      y: c * 2.4,
      vx: 0,
      vy: 0,
      life: 0.85,
      maxLife: 0.85,
      size: 1,
      kind: 10 + p,
      angle: (p % 2 ? -1 : 1) * 0.3,
      spin: 0,
      surface: 0
    }))
  }), {
    group: e,
    update: i
  };
}
var Et = new G.PlaneGeometry(1, 1),
  Mt = new G.MeshBasicMaterial({
    color: 16777215,
    transparent: !0,
    opacity: 0.9,
    depthWrite: !1
  });
function Qe() {
  let e = new G.Group(),
    a = new G.InstancedMesh(Et, Mt, B),
    r = Ze();
  a.frustumCulled = !1, e.add(a, r.group);
  let n = new G.Object3D(),
    t = new G.Color();
  return {
    group: e,
    update(o) {
      let i = 0;
      r.update(o);
      for (let s of o.particles) if (s.life > 0 && s.kind < 10) {
        if (n.position.set(s.x, s.y, 2.2), n.scale.setScalar(s.size * Math.min(1, s.life / 0.1)), n.rotation.z = s.life * s.vx, s.kind >= 3) {
          let c = s,
            p = Math.min(1, s.life / 0.35);
          n.scale.set(s.size * (c.surface ? 3.8 : 1.8) * p, s.size * (c.surface ? 0.48 : 0.85) * p, 1), n.rotation.z = c.angle;
        }
        n.updateMatrix(), a.setMatrixAt(i, n.matrix), t.setHex(s.kind === 1 || s.kind === 3 ? 7990477 : s.kind === 4 ? 16777215 : s.kind === 2 ? 16767102 : 10660516), a.setColorAt(i++, t);
      }
      a.count = i, a.instanceMatrix.needsUpdate = !0, a.instanceColor && (a.instanceColor.needsUpdate = !0);
    }
  };
}
import * as pe from "./vendor/002-three.js";
function et(e, a, r, n) {
  let t = e.camera,
    o = a.phase === "replay",
    i = o ? 1.26 : 1;
  a.cameraZoom += (i - a.cameraZoom) * (1 - Math.exp(-n * 4));
  let s = r.width / 2,
    c = r.height / 2,
    p = o ? pe.MathUtils.clamp(a.player.x, s - 3.1, s + 3.1) : s,
    l = o ? pe.MathUtils.clamp(a.player.y, c - 1.8, c + 1.8) : c;
  a.cameraX += (p - a.cameraX) * (1 - Math.exp(-n * 5)), a.cameraY += (l - a.cameraY) * (1 - Math.exp(-n * 5)), t.position.x = a.cameraX + Math.sin(a.presentationTime * 87) * a.shake * 0.22, t.position.y = a.cameraY + Math.cos(a.presentationTime * 71) * a.shake * 0.16, t.zoom = a.cameraZoom, t.updateProjectionMatrix(), e.hud.root.style.setProperty("--castle-safe-width", `${e.viewport.safeRect.width}px`);
}
function tt(e) {
  let a = j(),
    r = Qe(),
    n = ie(k[0]),
    t = le(),
    o = 0,
    i = 0;
  return e.scene.add(n.group, a.group, r.group, t.group), {
    update(s, c) {
      (o !== s.levelVersion || i !== s.levelIndex) && (e.scene.remove(n.group), n.dispose(), n = ie(k[s.levelIndex]), e.scene.add(n.group), o = s.levelVersion, i = s.levelIndex), s.attempts.length > t.capacity && (e.scene.remove(t.group), t.dispose(), t = le(Math.max(32, s.attempts.length * 2)), e.scene.add(t.group)), n.update(s.phase === "replay" ? Math.max(0, s.replayTime) : s.attemptTime, s.presentationTime), a.update(s.player, s.presentationTime, s.phase === "dead"), t.update(s), r.update(s), et(e, s, k[s.levelIndex], c);
    }
  };
}
var at = `
.rx-hud { --cc-scale: max(0.55, calc(var(--rx-hud-scale) * 0.54583333)); grid-template-columns: repeat(3,minmax(0,1fr)); --cc: #83ebcd; --gold: #e8bd77; --paper: #edead6; color: var(--paper); font-family: 'Trebuchet MS', sans-serif; }
.rx-hud-layer { min-width:0; max-width:100%; box-sizing:border-box; padding: calc(26px * var(--cc-scale)); }
.cc-brand { width:max-content; display:flex; align-items:center; gap:calc(12px * var(--cc-scale)); }
.cc-mark { color:var(--cc); font:calc(31px * var(--cc-scale)) Georgia,serif; text-shadow:0 0 24px #50dc9960; }
.cc-title { margin:0; white-space:nowrap; font: bold calc(20px * var(--cc-scale))/1.1 Georgia,serif; letter-spacing:calc(2px * var(--cc-scale)); }
.cc-eyebrow { margin-top:calc(7px * var(--cc-scale)); font-size:max(9px,calc(9px * var(--cc-scale))); letter-spacing:calc(3px * var(--cc-scale)); color:#a4aca5; text-transform:uppercase; }
.cc-timer { font:calc(36px * var(--cc-scale))/1.1 'Courier New',monospace; font-weight:bold; letter-spacing:calc(-2px * var(--cc-scale)); text-shadow:0 2px 12px #000; text-align:center; }
.cc-time-label { font-size:max(9px,calc(9px * var(--cc-scale))); letter-spacing:calc(2px * var(--cc-scale)); color:#a5b2ab; text-align:center; margin-top:calc(5px * var(--cc-scale)); }
.cc-starline { white-space:nowrap; color:var(--gold); font-size:calc(22px * var(--cc-scale)); letter-spacing:calc(4px * var(--cc-scale)); text-align:right; }
.cc-meta { white-space:nowrap; color:#a6b4ae; font:max(10px,calc(10px * var(--cc-scale)))/1.7 'Courier New',monospace; text-align:right; }
.cc-level { width:max-content; display:flex; align-items:center; gap:calc(14px * var(--cc-scale)); }
.cc-level-number { border:1px solid #9ba99050; width:calc(32px * var(--cc-scale)); height:calc(32px * var(--cc-scale)); display:grid; place-items:center; font:calc(17px * var(--cc-scale)) Georgia,serif; }
.cc-level-name { font:calc(15px * var(--cc-scale)) Georgia,serif; letter-spacing:calc(1px * var(--cc-scale)); }
.cc-level-note { color:#929e99; font-size:max(9px,calc(9px * var(--cc-scale))); letter-spacing:calc(1px * var(--cc-scale)); margin-top:calc(5px * var(--cc-scale)); }
.cc-controls { width:max-content; display:flex; gap:calc(16px * var(--cc-scale)); align-items:center; color:#a8b4ad; font-size:max(10px,calc(10px * var(--cc-scale))); }
.cc-controls span { white-space:nowrap; }
.cc-controls kbd { color:#e4e9d7; padding:calc(3px * var(--cc-scale)) calc(5px * var(--cc-scale)); border:1px solid #8d9a8c45; border-radius:2px; font:max(10px,calc(10px * var(--cc-scale))) 'Courier New',monospace; margin-right:calc(4px * var(--cc-scale)); background:#0c151dcc; }
.cc-actions { flex-direction:row; display:flex; gap:calc(6px * var(--cc-scale)); }
.cc-button { min-height:28px; pointer-events:auto; cursor:pointer; border:1px solid #9fae9b45; border-radius:2px; background:#111c24dd; color:#d6dfd3; font:max(10px,calc(10px * var(--cc-scale))) 'Trebuchet MS',sans-serif; padding:calc(9px * var(--cc-scale)) calc(12px * var(--cc-scale)); letter-spacing:calc(1px * var(--cc-scale)); text-transform:uppercase; }
.cc-button:hover,.cc-button:focus-visible { border-color:var(--cc); color:var(--cc); outline:none; }
.cc-primary { color:#112c2d; background:var(--cc); border-color:var(--cc); font-weight:bold; }
.cc-primary:hover { color:#07191b; background:#acffe2; }
.cc-intro { width:max-content; text-align:center; padding:calc(16px * var(--cc-scale)) calc(28px * var(--cc-scale)); margin-bottom:calc(12px * var(--cc-scale)); background:linear-gradient(90deg,#101a2000,#101a20e8 15%,#101a20e8 85%,#101a2000); }
.cc-intro h2 { font:italic calc(23px * var(--cc-scale)) Georgia,serif; margin:0 0 calc(7px * var(--cc-scale)); }
.cc-intro p { font-size:max(10px,calc(10px * var(--cc-scale))); margin:0; color:#b8c4b7; letter-spacing:calc(1px * var(--cc-scale)); }
.cc-replay { color:var(--cc); font-size:calc(11px * var(--cc-scale)); letter-spacing:calc(3px * var(--cc-scale)); text-transform:uppercase; display:flex; align-items:center; gap:calc(12px * var(--cc-scale)); margin-bottom:calc(16px * var(--cc-scale)); background:#0c1c22dc; border:1px solid #60ad9a50; padding:calc(12px * var(--cc-scale)) calc(18px * var(--cc-scale)); }
.cc-panel { max-height:calc(100dvh - 48px); overflow:auto; width:calc(450px * var(--cc-scale)); max-width:90vw; box-sizing:border-box; padding:calc(34px * var(--cc-scale)); text-align:center; background:linear-gradient(135deg,#1d2b30f8,#101921fa); border:1px solid #9cb89955; box-shadow:0 20px 90px #0009,inset 0 0 0 5px #111a2080; pointer-events:auto; }
.cc-panel h2 { font:calc(32px * var(--cc-scale)) Georgia,serif; margin:calc(12px * var(--cc-scale)) 0; font-weight:normal; }
.cc-panel p { font-size:calc(12px * var(--cc-scale)); color:#a4b6ad; line-height:1.7; }
.cc-panel-actions { display:flex; justify-content:center; gap:calc(10px * var(--cc-scale)); margin-top:calc(24px * var(--cc-scale)); }
.cc-panel .cc-button { padding:calc(13px * var(--cc-scale)) calc(18px * var(--cc-scale)); }
.cc-hidden { display:none!important; }
@media(max-width:700px) { .cc-intro p { display:none; } .cc-controls { flex-wrap:wrap; justify-content:center; width:110px; gap:5px; } .cc-eyebrow,.cc-level-note { display:none; } .cc-controls span:nth-child(n+3) { display:none; } .cc-title { font-size:calc(17px * var(--cc-scale)); } .cc-meta { font-size:max(9px,calc(9px * var(--cc-scale))); } }
@media(max-aspect-ratio: 6/5) { .cc-controls { gap:calc(7px * var(--cc-scale)); } .cc-controls .cc-optional { display:none; } }
`;
function rt(e) {
  return Math.max(0, e).toFixed(2).padStart(5, "0");
}
function z(e, a) {
  e.textContent !== a && (e.textContent = a);
}
function J(e, a, r, n = !1) {
  let t = document.createElement("button");
  return t.className = `cc-button${n ? " cc-primary" : ""}`, t.textContent = e, t.onclick = () => {
    r().uiAction = a;
  }, t;
}
function ot(e, a) {
  let r = document.createElement("style");
  r.textContent = at, document.head.appendChild(r);
  let n = e.hud.layer("top-left");
  n.innerHTML = `<div class="cc-brand"><div class="cc-mark">\u265C</div><div><h1 class="cc-title">CRAIG'S CASTLE</h1><div class="cc-eyebrow">A little light. A lethal climb.</div></div></div>`;
  let t = e.hud.layer("top");
  t.innerHTML = '<div class="cc-timer">00.00</div><div class="cc-time-label">THE CLOCK STARTS WITH YOU</div>';
  let o = t.children[0],
    i = t.children[1],
    s = e.hud.layer("top-right");
  s.innerHTML = '<div class="cc-starline">\u2606 \u2606 \u2606</div><div class="cc-meta"></div>';
  let c = s.children[0],
    p = s.children[1],
    l = e.hud.layer("bottom-left");
  l.innerHTML = '<div class="cc-level"><div class="cc-level-number">I</div><div><div class="cc-level-name"></div><div class="cc-level-note"></div></div></div>';
  let d = l.querySelector(".cc-level-number"),
    h = l.querySelector(".cc-level-name"),
    x = l.querySelector(".cc-level-note");
  h.style.cssText = "max-width:min(27vw,300px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap";
  let m = e.hud.layer("bottom"),
    u = document.createElement("div");
  u.className = "cc-intro", u.innerHTML = "<h2>Carry your little light.</h2><p>Reach the lantern. Leave your failed attempts behind.</p>";
  let f = document.createElement("div");
  f.className = "cc-replay cc-hidden";
  let M = document.createElement("span");
  f.append(M, J("Skip \u21B5", "skip", a));
  let g = document.createElement("div");
  g.className = "cc-controls", m.append(u, f, g);
  let R = document.createElement("div");
  R.classList.add("cc-actions"), s.append(R);
  let L = J("\u2161", "pause", a);
  L.title = "Pause \xB7 Escape / Start", R.append(L);
  let H = e.hud.layer("center", {
    interactive: !0
  });
  H.classList.add("cc-hidden");
  function st(w) {
    if (H.replaceChildren(), !w.paused || w.reported) {
      H.classList.add("cc-hidden");
      return;
    }
    H.classList.remove("cc-hidden");
    let S = document.createElement("div");
    if (S.className = "cc-panel", H.append(S), w.paused) {
      S.innerHTML = '<div class="cc-eyebrow">TAKE A BREATH</div><h2>The fire can wait.</h2><p>A / D or arrows to move \xB7 Space to jump<br>Hold jump for height \xB7 Shift to sprint<br>Push into a wall to slide. Jump to kick off.<br>Controller: stick / D-pad \xB7 A jump \xB7 X / RB sprint \xB7 Y retry</p>';
      let D = document.createElement("div");
      D.className = "cc-panel-actions", D.append(J("Resume", "resume", a, !0), J(w.musicMuted ? "Music off" : "Music on", "mute", a)), S.append(D);
      return;
    }
  }
  return {
    update(w) {
      R.classList.toggle("cc-hidden", w.reported);
      let S = k[w.levelIndex];
      z(o, rt(w.phase === "replay" ? w.replayTime : w.phase === "complete" && w.winTime > 0 ? w.winTime : w.attemptTime)), z(i, w.phase === "replay" ? "EVERY ATTEMPT. ONE VICTORY." : w.phase === "ready" ? "MOVE TO BEGIN" : `ATTEMPT ${String(w.deaths + 1).padStart(2, "0")}`);
      let D = Y(S, w.attemptTime);
      z(c, "\u2605 ".repeat(D) + "\u2606 ".repeat(3 - D)), z(p, e.viewport.width < 700 ? `3 STARS \u2264 ${S.gold}s` : `3 STARS \u2264 ${S.gold}s   /   BEST ${w.progress.best[S.id] ? rt(w.progress.best[S.id]) + "s" : "\u2014"}`), z(d, ["I", "II", "III", "IV", "V"][w.levelIndex] ?? String(w.levelIndex + 1)), z(h, S.name), z(x, S.subtitle), u.classList.toggle("cc-hidden", w.phase !== "ready" || w.deaths > 0 || w.paused), f.classList.toggle("cc-hidden", w.phase !== "replay"), z(M, `\u25CF REPLAY   /   ${w.attempts.length} ${w.attempts.length === 1 ? "attempt" : "attempts"}`);
      let xe = String(w.gamepadActive);
      g.dataset.pad !== xe && (g.dataset.pad = xe, g.innerHTML = w.gamepadActive ? "<span><kbd>LS / D-PAD</kbd> Move</span><span><kbd>A</kbd> Jump</span><span><kbd>X / RB</kbd> Sprint</span><span><kbd>Y</kbd> Retry</span>" : '<span><kbd>A D / \u2190 \u2192</kbd> Move</span><span><kbd>SPACE</kbd> Jump</span><span><kbd>SHIFT</kbd> Sprint</span><span class="cc-optional"><kbd>R</kbd> Retry</span>');
      let de = `${w.phase}/${w.paused}/${w.levelIndex}/${w.musicMuted}`;
      w.uiVersion !== de && (w.uiVersion = de, st(w));
    }
  };
}
var T, _, V;
await Tt({
  design: {
    width: 1280,
    height: 720
  },
  camera: Rt({
    frustumHeight: 21.5,
    heading: 0,
    pitch: 0,
    distance: 40,
    lookAt: new nt.Vector3(17, 10, 0),
    near: 0.1,
    far: 120
  }),
  background: 1055524,
  fixedStep: 1 / 120,
  maxPixelRatio: 1.75,
  assets: {
    audio: Re
  },
  setup(e) {
    T = U(e), _ = tt(e), V = ot(e, () => T), fe(e, () => T), _.update(T, 0), V.update(T);
  },
  restart(e, a) {
    e.audio.stopMusic(0.1), T = U(e, T, a), _.update(T, 0), V.update(T);
  },
  update(e, a) {
    if (!(!e.running || !T || T.reported)) {
      if (T.presentationTime += a, Ge(T, e, we(T), a), !e.running) {
        V.update(T);
        return;
      }
      Ae(T, a), He(e, T, a), T.events.length = 0;
    }
  },
  render(e, a) {
    !T || !e.running || T.reported || (_.update(T, a), V.update(T));
  }
});
