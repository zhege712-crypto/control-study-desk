"""Direct-state teaching recursion with optional one-step-old information.

No physical plant, noise, actuator, solver or research data is used.
Run: python history_feedback.py --gain 1.2 --delay
Check: python history_feedback.py --check
"""
import argparse
import json
import math


def trace(gain=0.5, delay=False, steps=12):
    if not math.isfinite(gain) or not 0 <= gain <= 3:
        raise ValueError("Gain must be in [0, 3]")
    previous = current = 4.0
    records = [{"k": 0, "error": current, "used_error": None, "input": None}]
    for k in range(steps):
        used = previous if delay else current
        applied = -gain * used
        previous, current = current, current + applied
        records.append({"k": k + 1, "error": current, "used_error": used, "input": applied})
    return records


def check():
    assert [p["error"] for p in trace(0.5, steps=2)] == [4, 2, 1]
    assert [p["error"] for p in trace(1.5, steps=3)] == [4, -2, 1, -0.5]
    assert all(math.isclose(p["error"], target, abs_tol=1e-12)
               for p, target in zip(trace(1.2, True, 3), [4, -0.8, -5.6, -4.64]))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--gain", type=float, default=0.5)
    parser.add_argument("--delay", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if args.check:
        check()
        print("History teaching fixture checks passed")
    else:
        print(json.dumps({"scope": "self-authored dimensionless teaching example", "gain": args.gain,
                          "one_step_delay": args.delay, "startup": {"e_minus_1": 4, "e_0": 4}}))
        for record in trace(args.gain, args.delay):
            print(json.dumps(record))
