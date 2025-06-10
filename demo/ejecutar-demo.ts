/**
 * Script de ejecución para la demostración de Validra
 */

import { spawn } from 'child_process';
import path from 'path';
import readline from 'readline';

const DEMOS = [
  { name: 'Demo síncrono avanzado', file: 'demo-sync-advanced.ts', icon: '🟢' },
  { name: 'Demo microservicio concurrente (sync/async)', file: 'microservice-example.ts', icon: '🔄' },
  { name: 'Demo streaming avanzado', file: 'demo-stream-advanced.ts', icon: '🔵' },
];

function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  while (true) {
    console.log('\n=== Selección de demo avanzado VALIDRA ===\n');
    DEMOS.forEach((demo, i) => {
      console.log(`${demo.icon}  [${i + 1}] ${demo.name}`);
    });
    console.log('');
    let idx = -1;
    while (idx < 0 || idx >= DEMOS.length) {
      const ans = await promptUser('¿Qué demo quieres ejecutar? (1-3): ');
      const n = Number(ans);
      if (n >= 1 && n <= DEMOS.length) {
        idx = n - 1;
      } else {
        console.log('Opción inválida. Intenta de nuevo.');
      }
    }
    const demo = DEMOS[idx];
    console.log(`\nEjecutando: ${demo.icon}  ${demo.name}\n`);
    // Ejecutar el demo usando ts-node
    const demoPath = path.join('demo/', demo.file);
    const child = spawn('tsx', [demoPath], { stdio: 'inherit', shell: true });
    await new Promise(resolve => child.on('exit', resolve));
    const otra = await promptUser('\n¿Quieres ejecutar otro demo? (s/N): ');
    if (!/^s/i.test(otra)) {
      break;
    }
  }
}

main();
