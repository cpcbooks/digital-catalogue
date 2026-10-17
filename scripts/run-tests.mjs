#!/usr/bin/env node
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

const nodeTests = readdirSync("tests").filter(name => name.endsWith(".test.cjs")).map(name => `tests/${name}`);
run(process.execPath, ["--test", ...nodeTests]);
run(process.env.PYTHON || (process.platform === "win32" ? "python" : "python3"), ["-m", "unittest", "tests/publication_master_preflight_test.py"]);
