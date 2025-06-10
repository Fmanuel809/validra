// Script para debuggear el problema del modo síncrono
import { generateAdvancedDemoData } from './demo/data-generator-advanced';
import { advancedRules } from './demo/ruleset-advanced';
import { ValidraEngine } from './src/engine/validra-engine';

console.log('🔍 DEBUGGING SYNC VALIDATION ISSUE');
console.log('=====================================');

// Crear engine con debug habilitado
const engine = new ValidraEngine(advancedRules, {
  debug: true,
  allowPartialValidation: true, // Para que no se detenga en errores
});

console.log('\n📋 Reglas cargadas:');
advancedRules.forEach((rule, i) => {
  console.log(`  ${i + 1}. ${rule.op} en campo '${rule.field}'`);
});

// Generar UN SOLO dato para debug detallado
console.log('\n📊 Generando 1 dato de prueba...');
const data = generateAdvancedDemoData(1, 0.0); // 0% inválidos = 100% válidos
const testItem = data[0];

console.log('\n🔍 Datos generados:');
console.log(JSON.stringify(testItem, null, 2));

console.log('\n🔄 Ejecutando validación síncrona...');
try {
  const result = engine.validate(testItem);

  console.log('\n✅ Resultado de validación:');
  console.log(`- isValid: ${result.isValid}`);
  console.log('- Errores:', result.errors);

  if (result.errors) {
    console.log('\n❌ Detalle de errores:');
    Object.entries(result.errors).forEach(([field, errors]) => {
      console.log(`  Campo '${field}':`, errors);
    });
  }
} catch (error) {
  console.error('\n💥 ERROR CRÍTICO:', error);
}

// Obtener métricas del ErrorHandler
console.log('\n📊 Métricas del ErrorHandler:');
const metrics = engine.getMetrics();
console.log(JSON.stringify(metrics.errorHandler, null, 2));

console.log('\n🔍 Debug completado');
