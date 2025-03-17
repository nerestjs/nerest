#!/usr/bin/env node
// All executions of `nerest <command>` get routed through here
import 'dotenv/config';

import { build } from './build.js';
import { typegen } from './typegen.js';
import { watch } from './watch.js';

// TODO: add CLI help and manual, maybe use a CLI framework like oclif
async function cliEntry(args: string[]) {
  if (args[0] === 'build') {
    await build();
  } else if (args[0] === 'typegen') {
    await typegen(args.slice(1));
  } else if (args[0] === 'watch') {
    await watch();
  }
}

// [<path to node>, <path to nerest binary>, ...args]
const args = process.argv.slice(2);
cliEntry(args);
