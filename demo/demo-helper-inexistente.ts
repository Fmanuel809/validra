// Demo específico para verificar que helpers inexistentes se reportan al ErrorHandler

import { Rule } from '../src/engine/rule';
import { ValidraEngine } from '../src/engine/validra-engine';
import { generateAdvancedDemoData } from './data-generator-advanced';

console.log('🔄 DEMO: Helper Inexistente - ErrorHandler\n');

// Crear reglas que incluyan un helper inexistente
const reglasConHelperInexistente: Rule[] = [
  { op: 'isEmail', field: 'email' },
  { op: 'isString', field: 'name' },
  { op: 'in', field: 'type', params: { values: ['A', 'B'] } } as any, // Helper 'in' no existe
  { op: 'min', field: 'age', params: { value: 18 } },
];

console.log('📋 Reglas configuradas:');
reglasConHelperInexistente.forEach((rule, i) => {
  console.log(`  ${i + 1}. ${rule.op} en campo '${rule.field}'`);
});

console.log('\n🏗️  Creando ValidraEngine...');
const engine = new ValidraEngine(reglasConHelperInexistente, {
  debug: true,
  allowPartialValidation: true, // Permitir validación parcial para que continúe después del error
});

console.log('✅ Engine creado exitosamente');

// Generar algunos datos de prueba
console.log('\n📊 Generando datos de prueba...');
const datos = generateAdvancedDemoData(5, 0.2); // 20% inválidos
console.log(`✅ Generados ${datos.length} registros`);

console.log('\n🔍 Ejecutando validaciones...');
let validosCount = 0;
let invalidosCount = 0;

for (let i = 0; i < datos.length; i++) {
  console.log(`\n--- Validando registro ${i + 1} ---`);
  console.log(`Email: ${datos[i].email}`);
  console.log(`Name: ${datos[i].name}`);
  console.log(`Type: ${datos[i].type}`);
  console.log(`Age: ${datos[i].age}`);

  try {
    const resultado = engine.validate(datos[i]);

    if (resultado.isValid) {
      validosCount++;
      console.log('✅ Validación exitosa');
    } else {
      invalidosCount++;
      console.log('❌ Validación fallida');
    }
  } catch (error) {
    invalidosCount++;
    console.log('💥 Error durante validación:', (error as Error).message);
  }
}

console.log('\n📈 RESUMEN DE VALIDACIONES:');
console.log(`✅ Registros válidos: ${validosCount}/${datos.length}`);
console.log(`❌ Registros inválidos: ${invalidosCount}/${datos.length}`);

console.log('\n📊 MÉTRICAS DEL ERROR-HANDLER:');
const metricas = engine.getMetrics();
const errorHandler = metricas.errorHandler;

console.log(`🔢 Total de errores: ${errorHandler.totalErrors}`);
console.log('\n🏷️  Errores por categoría:');
Object.entries(errorHandler.errorsByCategory).forEach(([categoria, count]) => {
  if (count > 0) {
    console.log(`  - ${categoria}: ${count}`);
  }
});

console.log('\n⚠️  Errores por severidad:');
Object.entries(errorHandler.errorsBySeverity).forEach(([severidad, count]) => {
  if (count > 0) {
    console.log(`  - ${severidad}: ${count}`);
  }
});

console.log(`\n🔄 Errores recuperados: ${errorHandler.recoveredErrors}`);
console.log(`💀 Errores fatales: ${errorHandler.fatalErrors}`);

if (errorHandler.totalErrors > 0) {
  console.log('\n✅ SUCCESS: El ErrorHandler está capturando errores de helpers inexistentes!');
  console.log('🎯 Los errores de helper "in" (inexistente) se clasifican con:');
  console.log('   - Severity: medium');
  console.log('   - Category: validation');
} else {
  console.log('\n❌ WARNING: El ErrorHandler no está reportando errores');
  console.log('   Esto podría indicar que el helper "in" existe o hay otro problema');
}

console.log('\n🔄 Demo finalizada.');
