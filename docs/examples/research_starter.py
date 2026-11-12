"""Deterministic teaching fixtures, not a scientific experiment or paper reproduction.

Run: python research_starter.py --check
Then: python research_starter.py --case motion
Cases emit JSON Lines to stdout; redirect output to keep your own teaching log.
Only the Python standard library is needed. No network or workspace data is used.
"""
import argparse
import json
import math


def motion_step(position, velocity, acceleration, period):
    return (position + period * velocity + 0.5 * period**2 * acceleration,
            velocity + period * acceleration)


def consensus_step(state, gain=0.2):
    neighbors = ((1,), (0, 2), (1, 3), (2,))
    return [state[i] + gain * sum(state[j] - state[i] for j in row)
            for i, row in enumerate(neighbors)]


def feedback_step(state, gain=0.5, period=1.0, limit=None):
    nominal = -gain * state
    applied = nominal if limit is None else min(limit, max(-limit, nominal))
    return state + period * applied, nominal, applied


def check():
    assert motion_step(10, 2, -1, 1) == (11.5, 1)
    assert motion_step(11.5, 1, -1, 1) == (12, 0)
    half = motion_step(10, 2, -1, 0.5)
    assert motion_step(*half, -1, 0.5) == (11.5, 1)
    assert consensus_step([10, 30, 70, 90]) == [14, 34, 66, 86]
    assert math.isclose(sum(consensus_step([10, 30, 70, 90])) / 4, 50)
    assert feedback_step(4) == (2, -2, -2)
    assert feedback_step(4, limit=1) == (3, -2, -1)
    assert feedback_step(4, gain=2.5)[0] == -6
    # These scalar checks accompany an explicit interval argument in the lesson.
    assert math.isclose(0.8 * 1 + 0.1, 0.9)
    assert math.isclose(1 - 0.2 + 0.3, 1.1)


def emit(**record):
    print(json.dumps(record, ensure_ascii=False))


def run(case):
    emit(scope="self-authored teaching fixture", case=case)
    if case == "motion":
        position, velocity, period = 10.0, 2.0, 1.0
        emit(k=0, time_s=0, position_m=position, velocity_m_s=velocity)
        for k in range(2):
            old_position, old_velocity = position, velocity
            position, velocity = motion_step(position, velocity, -1, period)
            emit(k=k+1, time_s=(k+1)*period, old_position_m=old_position,
                 old_velocity_m_s=old_velocity, acceleration_m_s2=-1,
                 position_m=position, velocity_m_s=velocity)
    elif case == "consensus":
        state = [10, 30, 70, 90]
        emit(k=0, state=state, mean=sum(state)/4)
        for k in range(2):
            old = state.copy()
            state = consensus_step(old)
            emit(k=k+1, old_state=old, state=state, mean=sum(state)/4)
    elif case == "feedback":
        state = 4.0
        emit(k=0, state=state, reference=0, gain=0.5, period=1, input_limit=1)
        for k in range(3):
            old = state
            state, nominal, applied = feedback_step(old, limit=1)
            emit(k=k+1, old_state=old, nominal=nominal, applied=applied, state=state)
    else:
        emit(model="x_next=x+u+w", state_bound=1, input_bound=0.2,
             policy="u=-0.2*x", disturbance_bound=0.1,
             analytic_image_interval=[-0.9, 0.9])
        emit(kind="boundary counterexample with enlarged disturbance",
             state=1, best_negative_input=-0.2, disturbance=0.3, next_state=1.1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--case", choices=("motion", "feedback", "consensus", "invariant"), default="motion")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if args.check:
        check()
        print("Teaching fixture checks passed")
    else:
        run(args.case)
