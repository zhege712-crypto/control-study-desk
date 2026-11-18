"""First control exercises, standard library only.

These are the same simplified teaching rules used by the #view=zero lessons, so the
browser lab and this script agree step for step. They are not physical simulations
and are not paper reproductions.

    python first_control.py --check
    python first_control.py --case heat
    python first_control.py --case speed
    python first_control.py --case agree
"""
import argparse
import json

HEAT = {"ambient": 10.0, "heater_gain": 1.2, "loss_rate": 0.08, "target": 22.0, "window_step": 40, "window_ambient": 2.0}
SPEED = {"target": 20.0, "drift_rate": 0.05, "max_accel": 2.0, "start": 0.0}
AGREE = {"initial": [0.0, 6.0, 12.0], "gain": 0.2, "steps": 40}
TOTAL_STEPS = 60


def clamp(value, low, high):
    return max(low, min(high, value))


def proportional(measured, target, gain, limit):
    return clamp(gain * (target - measured), -limit, limit)


def heat_step(temperature, power, ambient=HEAT["ambient"]):
    loss = HEAT["loss_rate"] * (temperature - ambient)
    return temperature + HEAT["heater_gain"] * clamp(power, 0.0, 1.0) - loss


def heat_history(mode="closed", gain=0.3, power=0.65, steps=TOTAL_STEPS, open_window=False):
    records = [{"step": 0, "temperature": HEAT["ambient"], "power": 0.0}]
    for k in range(1, steps + 1):
        ambient = HEAT["window_ambient"] if open_window and k >= HEAT["window_step"] else HEAT["ambient"]
        previous = records[-1]["temperature"]
        command = clamp(power, 0.0, 1.0) if mode == "open" else proportional(previous, HEAT["target"], gain, 1.0)
        records.append({"step": k, "temperature": heat_step(previous, command, ambient), "power": command})
    return records


def speed_step(speed, accel, slope=0.0):
    return speed + clamp(accel, -SPEED["max_accel"], SPEED["max_accel"]) - SPEED["drift_rate"] * speed - slope


def speed_history(gain=0.5, slope=0.0, steps=TOTAL_STEPS):
    records = [{"step": 0, "speed": SPEED["start"], "accel": 0.0}]
    for k in range(1, steps + 1):
        previous = records[-1]["speed"]
        command = proportional(previous, SPEED["target"], gain, SPEED["max_accel"])
        records.append({"step": k, "speed": speed_step(previous, command, slope), "accel": command})
    return records


def agree_step(positions, gain=AGREE["gain"]):
    a, b, c = positions
    return [a + gain * (b - a), b + gain * ((a - b) + (c - b)), c + gain * (b - c)]


def agree_history(gain=AGREE["gain"], steps=AGREE["steps"]):
    history = [list(AGREE["initial"])]
    for _ in range(steps):
        history.append(agree_step(history[-1], gain))
    return history


def mean(values):
    return sum(values) / len(values)


def check():
    # Hand-checked values; the checker recomputes them independently in JavaScript.
    closed = heat_history(mode="closed", gain=0.3, steps=3)
    assert abs(closed[1]["temperature"] - 11.2) < 1e-12, closed
    assert abs(closed[2]["temperature"] - 12.304) < 1e-12, closed
    assert abs(heat_history(mode="open", power=0.65, steps=400)[-1]["temperature"] - 19.75) < 1e-6
    assert abs(heat_step(22.0, 0.0) - 21.04) < 1e-12
    assert abs(speed_step(20.0, 0.0) - 19.0) < 1e-12
    assert abs(speed_history(gain=0.5, steps=400)[-1]["speed"] - 18.1818181818) < 1e-9
    first = agree_step([0.0, 6.0, 12.0])
    assert all(abs(a - b) < 1e-12 for a, b in zip(first, [1.2, 6.0, 10.8])), first
    assert abs(mean(first) - 6.0) < 1e-12
    assert abs(mean(agree_history(steps=20)[-1]) - 6.0) < 1e-12
    print("first_control.py checks passed: heat, cruise and agreement fixtures agree with the lesson tables.")


def main():
    parser = argparse.ArgumentParser(description="First control teaching exercises (standard library only)")
    parser.add_argument("--check", action="store_true", help="run the fixture checks")
    parser.add_argument("--case", choices=["heat", "speed", "agree"], help="print one teaching record")
    args = parser.parse_args()
    if args.check:
        check()
        return
    if args.case == "heat":
        rows = heat_history(mode="closed", gain=0.3)
    elif args.case == "speed":
        rows = speed_history(gain=0.5)
    elif args.case == "agree":
        rows = [{"step": k, "positions": positions} for k, positions in enumerate(agree_history())]
    else:
        parser.error("choose --check or --case heat|speed|agree")
    print(json.dumps({"case": args.case, "records": rows}, ensure_ascii=False))


if __name__ == "__main__":
    main()
