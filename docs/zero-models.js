// Deterministic first-course teaching models. Plain numbers, no research workspace plants.
// Every function is pure and synchronous so the browser view and the Node checker share it.

export const HEAT = Object.freeze({ambient:10, heaterGain:1.2, lossRate:0.08, target:22, windowStep:40, windowAmbient:2});
export const SPEED = Object.freeze({target:20, driftRate:0.05, maxAccel:2, start:0});
export const AGREE = Object.freeze({initial:[0,6,12], gain:0.2, steps:40});
export const TOTAL_STEPS = 60;

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

// One minute of a simplified room heater. u is the heater command in [0,1].
// The room loses heat faster as it becomes warmer; the outside temperature can drop (open window).
export function heatStep(temperature, power, {ambient = HEAT.ambient} = {}) {
  const loss = HEAT.lossRate * (temperature - ambient);
  return temperature + HEAT.heaterGain * clamp(power, 0, 1) - loss;
}

// The simplest automatic rule: push harder the farther away the measured value is.
export function proportional(measured, target, gain, limit = 1) {
  return clamp(gain * (target - measured), -limit, limit);
}

export function heatHistory({mode = 'closed', gain = 0.3, power = 0.65, steps = TOTAL_STEPS, openWindow = false, delay = 0} = {}) {
  const history = [{step: 0, temperature: HEAT.ambient, power: 0}];
  for (let k = 1; k <= steps; k++) {
    const ambient = openWindow && k >= HEAT.windowStep ? HEAT.windowAmbient : HEAT.ambient;
    const previous = history[k - 1].temperature;
    // A delayed controller acts on an older measurement (sensor, network or computation lag).
    const measured = history[Math.max(0, k - 1 - delay)].temperature;
    const command = mode === 'open' ? clamp(power, 0, 1) : proportional(measured, HEAT.target, gain, 1);
    history.push({step: k, temperature: heatStep(previous, command, {ambient}), power: command});
  }
  return history;
}

// One second of a simplified cruise-control car. accel is in m/s per second.
export function speedStep(speed, accel, {slope = 0} = {}) {
  return speed + clamp(accel, -SPEED.maxAccel, SPEED.maxAccel) - SPEED.driftRate * speed - slope;
}

export function speedHistory({gain = 0.5, slope = 0, delay = 0, steps = TOTAL_STEPS} = {}) {
  const history = [{step: 0, speed: SPEED.start, accel: 0}];
  for (let k = 1; k <= steps; k++) {
    const previous = history[k - 1].speed;
    const measured = history[Math.max(0, k - 1 - delay)].speed;
    const command = proportional(measured, SPEED.target, gain, SPEED.maxAccel);
    history.push({step: k, speed: speedStep(previous, command, {slope}), accel: command});
  }
  return history;
}

// Three robots on a line; each one only talks to its direct neighbour and nudges itself toward it.
// The average of the three positions never changes because every exchange is zero-sum.
export function agreeStep(positions, gain = AGREE.gain) {
  const [a, b, c] = positions;
  return [
    a + gain * (b - a),
    b + gain * ((a - b) + (c - b)),
    c + gain * (b - c),
  ];
}

export function agreeHistory({gain = AGREE.gain, steps = AGREE.steps, initial = AGREE.initial} = {}) {
  const history = [{step: 0, positions: initial.slice()}];
  for (let k = 1; k <= steps; k++) {
    history.push({step: k, positions: agreeStep(history[k - 1].positions, gain)});
  }
  return history;
}

export const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
export const spread = values => Math.max(...values) - Math.min(...values);

// Used by the lesson copy and the checker: the measured steady value of a constant open-loop command.
export function heatEquilibrium(power, ambient = HEAT.ambient) {
  return ambient + (HEAT.heaterGain * clamp(power, 0, 1)) / HEAT.lossRate;
}
export function speedEquilibrium(gain, slope = 0) {
  return (gain * SPEED.target - slope) / (SPEED.driftRate + gain);
}
