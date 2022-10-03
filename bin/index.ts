#!/usr/bin/env node
// All executions of `nerest <command>` get routed through here
import { watch } from './watch';

async function cliEntry(args: string[]) {
  if (args[0] === 'watch') {
    await watch();
  }
}

// [<path to node>, <path to nerest binary>, ...args]
const args = process.argv.slice(2);
cliEntry(args);
