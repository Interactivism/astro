# Test Program Stub

This directory is a stub for the program agnosticism acceptance test.

**Status:** Placeholder — to be built in Build 3.

**Purpose:** A synthetic second vertical program config to prove that BD agents are truly parameterized and will run correctly for any vertical, not just Aerospace & Defense.

## What Build 3 will add

- `config.yaml` — a dummy program with different ICP, credential anchors, and voice corpus
- Test script in `tests/` that instantiates a BD agent sequence using this config and verifies no A&D-specific content leaks in
