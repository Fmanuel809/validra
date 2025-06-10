/**
 * Script de ejecución para la demostración de Validra
 */

import { SistemaValidacionSimple } from './demo/demo-validra-simple';

async function ejecutarDemo(): Promise<void> {
  console.log('🎯 INICIANDO DEMOSTRACIÓN DE VALIDRA');
  console.log('====================================');

  try {
    const sistema = new SistemaValidacionSimple();
    await sistema.ejecutarDemostracion();
  } catch (error) {
    console.error('Error:', error);
  }
}

ejecutarDemo();
