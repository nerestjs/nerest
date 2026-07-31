#!/usr/bin/env node
// All executions of `nerest <command>` get routed through here
import 'dotenv/config';

// TODO: add CLI help and manual, maybe use a CLI framework like oclif
async function cliEntry(args: string[]) {
  if (args[0] === 'build') {
    const { build } = await import('./build.js');
    await build();
  } else if (args[0] === 'typegen') {
    const { typegen } = await import('./typegen.js');
    await typegen(args.slice(1));
  } else if (args[0] === 'watch') {
    const { watch } = await import('./watch.js');
    await watch();
  } else if (args[0] === 'start') {
    const { start } = await import('./start.js');
    await start();
  }
}

// [<path to node>, <path to nerest binary>, ...args]
const args = process.argv.slice(2);
cliEntry(args);
