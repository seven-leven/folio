/** Running other programs (git, gh, npm, Rhino, Blender) from the tools. */
import { spawn, type SpawnOptions } from "node:child_process";

export interface Result {
  success: boolean;
  code: number | null;
  stdout: string;
  stderr: string;
}

/** Runs a program and collects what it prints. Never throws: a missing program is a failed result. */
export function capture(cmd: string, args: string[], options: SpawnOptions = {}): Promise<Result> {
  return new Promise((resolve) => {
    let stdout = "", stderr = "";
    const child = spawn(cmd, args, { ...options, stdio: ["ignore", "pipe", "pipe"] });
    child.stdout?.on("data", (d) => (stdout += d));
    child.stderr?.on("data", (d) => (stderr += d));
    child.on("error", (err) => resolve({ success: false, code: null, stdout, stderr: stderr + err.message }));
    child.on("close", (code) => resolve({ success: code === 0, code, stdout, stderr }));
  });
}

/** Runs a program with its output shown as it goes; true if it succeeded. */
export function inherit(cmd: string, args: string[], options: SpawnOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    // npm is npm.cmd on Windows, which needs a shell to start
    const shell = process.platform === "win32" && cmd === "npm";
    const child = spawn(cmd, args, { ...options, stdio: "inherit", shell });
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}
