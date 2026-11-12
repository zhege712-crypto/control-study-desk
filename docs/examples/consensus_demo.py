"""Four-agent discrete consensus: standard library only, Python 3.

This is a teaching recurrence, not a vehicle model or a paper reproduction.
Run: python consensus_demo.py
"""

INITIAL = [10.0, 30.0, 70.0, 90.0]
GRAPHS = {
    'path': [(0, 1), (1, 2), (2, 3)],
    'split': [(0, 1), (2, 3)],
}


def step(state, edges, gain=0.2):
    # Accumulate from one common snapshot; never update agents in place.
    change = [0.0] * len(state)
    for i, j in edges:
        flow = gain * (state[j] - state[i])
        change[i] += flow
        change[j] -= flow
    return [x + dx for x, dx in zip(state, change)]


def run(name, steps=60):
    state = INITIAL.copy()
    for _ in range(steps):
        state = step(state, GRAPHS[name])
    average = sum(state) / len(state)
    print(name, 'step=', steps, 'states=', [round(x, 4) for x in state])
    print('mean=', round(average, 8), 'spread=', round(max(state) - min(state), 6))
    # Symmetric pair exchanges conserve the average, even when disconnected.
    assert abs(average - 50.0) < 1e-10
    return state


if __name__ == '__main__':
    connected = run('path')
    disconnected = run('split')
    assert max(connected) - min(connected) < 0.1
    assert abs(disconnected[0] - 20.0) < 1e-6
    assert abs(disconnected[3] - 80.0) < 1e-6
    print('Teaching checks passed. The graph and update rule are assumptions, not empirical findings.')
