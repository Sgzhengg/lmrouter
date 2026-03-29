import subprocess
import time
import sys

ports = [8000, 8001, 8002]
processes = []

print("Starting MockLLM servers...")

for port in ports:
    print(f"Starting MockLLM on port {port}...")
    process = subprocess.Popen(
        [sys.executable, "-m", "mockllm", "--port", str(port)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    processes.append(process)
    print(f"✓ Started MockLLM on port {port} (PID: {process.pid})")

print("\nWaiting for servers to be ready...")
time.sleep(3)

print("\n✅ All MockLLM servers started!")
print("Press Ctrl+C to stop all servers")

try:
    # Keep script running
    for process in processes:
        process.wait()
except KeyboardInterrupt:
    print("\n\nStopping all MockLLM servers...")
    for process in processes:
        process.terminate()
    print("✓ All servers stopped")
