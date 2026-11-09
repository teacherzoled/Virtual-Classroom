#!/usr/bin/env bash
# Runs every Computer Club test against the REAL backend/.gs + REAL Worker (mock Sheet, no live data touched).
# Needs: node 18+, python3, playwright (pip install playwright), Chrome (set CHROME=/path/to/chrome if not /usr/bin/google-chrome).
cd "$(dirname "$0")"
fail=0
node test-gas.js > /dev/null && echo "PASS backend: test-gas" || { echo "FAIL backend: test-gas"; fail=1; }
node test-xp.js  > /dev/null && echo "PASS backend: test-xp"  || { echo "FAIL backend: test-xp";  fail=1; }
run() {  # $1 = test name
  if timeout 300 python3 "$1.py" > "/tmp/cc-$1.log" 2>&1; then echo "PASS browser: $1"; else echo "FAIL browser: $1 (see /tmp/cc-$1.log)"; fail=1; fi
}
start() { node server.mjs > /tmp/cc-server.log 2>&1 & SRV=$!; sleep 1.5; }
stop()  { kill $SRV 2>/dev/null; wait $SRV 2>/dev/null; }
# Chain: e2e sets club code BYTE7 + opens the club; the next three continue on the SAME mock Sheet (e2e-week changes the code to WEEK3, so it runs last).
start; for t in e2e e2e2 e2e-xp2 e2e-week; do run $t; done; stop
# Standalone tests: a fresh mock Sheet each.
for t in e2e-missions e2e-stars e2e-switch e2e-box e2e-pools e2e-xp e2e-timer e2e-float; do start; run $t; stop; done
exit $fail
