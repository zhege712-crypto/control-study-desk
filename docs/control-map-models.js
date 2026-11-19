// Deterministic teaching models for the control-structure map's side examples.
// Pure functions so the browser view and tools/check_map.mjs share the same numbers.

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

// A simplified second-order object x'' = u pulled to x = 1 by a proportional gain plus a
// fixed damping term: u = k(1 - x) - 0.9 xdot. The actuator is limited to +/-10.
// This isolates the gain trade-off: faster response versus overshoot. It is not a plant model.
export const GAIN = Object.freeze({target: 1, damping: 0.9, dt: 0.05, maxSteps: 160, uMax: 10, tolerance: 0.05});

export function gainScene(gain = 1.2) {
  const {target, damping, dt, maxSteps, uMax, tolerance} = GAIN;
  let x = 0, v = 0;
  const points = [[0, x]];
  let peak = 0, settleStep = null;
  for (let k = 1; k <= maxSteps; k++) {
    const u = clamp(gain * (target - x) - damping * v, -uMax, uMax);
    v += u * dt;
    x += v * dt;
    points.push([k * dt, x]);
    peak = Math.max(peak, x);
    if (Math.abs(x - target) > tolerance) settleStep = null;
    else if (settleStep === null) settleStep = k;
  }
  const overshoot = Math.max(0, peak - target);
  return {
    gain, target, points, overshoot,
    settleTime: settleStep === null ? null : settleStep * dt,
    settleLabel: settleStep === null ? '8 s 内没有进入 ±5%' : `${(settleStep * dt).toFixed(1)} s 后进入 ±5%`,
  };
}

// Three robots on a line. Each only exchanges information with its direct neighbour.
// Every exchange is zero-sum, so the average is preserved while the spread shrinks on a
// stable gain range. This three-node chain loses stability above about g = 0.66.
export const CONSENSUS = Object.freeze({initial: [0, 4, 14], steps: 40, mean: 6});

export function consensusScene(gain = 0.2) {
  let positions = CONSENSUS.initial.slice();
  const points = [[0, ...positions]];
  for (let k = 1; k <= CONSENSUS.steps; k++) {
    const [a, b, c] = positions;
    positions = [
      a + gain * (b - a),
      b + gain * ((a - b) + (c - b)),
      c + gain * (b - c),
    ];
    points.push([k, ...positions]);
  }
  const spread = Math.max(...positions) - Math.min(...positions);
  return {gain, points, initialSpread: 14, finalSpread: spread, mean: CONSENSUS.mean, oscillates: gain >= 0.6, diverges: gain > 0.66};
}

// Scalar barrier-filter teaching example. The safety margin h has margin dynamics
// hdot = -b + u; a simplified CBF condition hdot + 2h >= 0 gives u >= b - 2h.
// The actuator only accepts -1 <= u <= 1, so some states have no safe input at all.
export const BARRIER = Object.freeze({alpha: 2, uMin: -1, uMax: 1});

export function barrierScene({margin = 0.2, drift = 0, nominal = -1} = {}) {
  const lower = Math.max(BARRIER.uMin, drift - BARRIER.alpha * margin);
  const upper = BARRIER.uMax;
  const feasible = lower <= upper;
  const filtered = feasible ? clamp(nominal, lower, upper) : null;
  return {
    margin, drift, nominal, lower, upper, feasible, filtered,
    changed: feasible && Math.abs(filtered - nominal) > 1e-9,
  };
}
