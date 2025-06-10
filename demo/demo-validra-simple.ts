/**
 * APLICACIÓN SIMPLIFICADA DE DEMOSTRACIÓN - VALIDRA
 *
 * Esta aplicación demuestra el uso de los componentes principales de Validra
 * con un enfoque funcional y compatible con la estructura actual.
 */

import { ValidraEngineOptions } from '../src/engine/interfaces/validra-options';
import { ValidraResult } from '../src/engine/interfaces/validra-result';
import { Rule } from '../src/engine/rule';
import { ValidraEngine } from '../src/engine/validra-engine';
import { ValidraLogger } from '../src/utils/validra-logger';

// ========================================
// TIPOS Y INTERFACES
// ========================================

interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  edad: number;
  estado: 'activo' | 'inactivo' | 'suspendido';
}

// ========================================
// REGLAS DE VALIDACIÓN
// ========================================

const reglasUsuario: Rule[] = [
  { op: 'isEmpty', field: 'nombre', negative: true },
  { op: 'isEmail', field: 'email' },
  { op: 'isNumber', field: 'edad' },
  { op: 'gte', field: 'edad', params: { value: 18 } },
  { op: 'lte', field: 'edad', params: { value: 120 } },
  { op: 'isString', field: 'estado' },
];

// ========================================
// SISTEMA DE VALIDACIÓN
// ========================================

class SistemaValidacionSimple {
  private engine: ValidraEngine;
  private logger: ValidraLogger;
  private estadisticas = {
    validaciones: 0,
    errores: 0,
    tiempoTotal: 0,
  };

  constructor() {
    this.logger = new ValidraLogger('SistemaValidacion', { debug: false, silent: true });
    this.inicializarEngine();
  }

  private inicializarEngine(): void {
    const opciones: ValidraEngineOptions = {
      debug: false,
      silent: true,
      throwOnUnknownField: false,
      allowPartialValidation: false,
      enableMemoryPool: true,
      memoryPoolSize: 50,
      enableStreaming: true,
      streamingChunkSize: 100,
    };

    this.engine = new ValidraEngine(reglasUsuario, opciones);
    this.logger.info('Engine de validación inicializado');
  }

  // Validación Síncrona
  public validarUsuario(usuario: Usuario): ValidraResult<Usuario> {
    const inicio = performance.now();
    this.estadisticas.validaciones++;

    try {
      this.logger.info('Validando usuario', { email: usuario.email });

      const resultado = this.engine.validate(usuario, {
        failFast: false,
        maxErrors: 10,
      });
      console.log('Resultado de validación:', this.engine.getMetrics());

      const duracion = performance.now() - inicio;
      this.estadisticas.tiempoTotal += duracion;

      if (!resultado.isValid) {
        this.estadisticas.errores++;
      }

      this.mostrarResultado('Validación Síncrona', resultado, duracion);
      return resultado;
    } catch (error) {
      this.logger.error('Error en validación', error);
      throw error;
    }
  }

  // Validación Asíncrona
  public async validarUsuarioAsync(usuario: Usuario): Promise<ValidraResult<Usuario>> {
    const inicio = performance.now();
    this.estadisticas.validaciones++;

    try {
      this.logger.info('Validando usuario asíncrono', { email: usuario.email });

      const resultado = await this.engine.validateAsync(usuario);
      console.log('Resultado de validación:', this.engine.getMetrics());

      const duracion = performance.now() - inicio;
      this.estadisticas.tiempoTotal += duracion;

      if (!resultado.isValid) {
        this.estadisticas.errores++;
      }

      this.mostrarResultado('Validación Asíncrona', resultado, duracion);
      return resultado;
    } catch (error) {
      this.logger.error('Error en validación asíncrona', error);
      throw error;
    }
  }

  // Validación en Streaming
  public async procesarLoteUsuarios(usuarios: Usuario[]): Promise<void> {
    this.logger.info(`Procesando lote de ${usuarios.length} usuarios`);

    let procesados = 0;
    let válidos = 0;
    let inválidos = 0;

    try {
      for await (const resultado of this.engine.validateStream(usuarios)) {
        procesados++;

        if (resultado.isValid) {
          válidos++;
        } else {
          inválidos++;
        }

        if (procesados % 10 === 0) {
          this.logger.debug(`Procesados: ${procesados}/${usuarios.length}`);
        }
      }
      console.log('Resultado de validación:', this.engine.getMetrics());

      this.logger.info('Lote completado', {
        total: procesados,
        válidos,
        inválidos,
        tasa: `${((válidos / procesados) * 100).toFixed(1)}%`,
      });
    } catch (error) {
      this.logger.error('Error en procesamiento de lote', error);
      throw error;
    }
  }

  // Obtener métricas del sistema
  public obtenerMetricas(): any {
    const metricasEngine = this.engine.getMetrics();
    console.log('Métricas del engine:', metricasEngine);

    return {
      sistema: this.estadisticas,
      engine: metricasEngine,
      rendimiento: {
        promedioMs: this.estadisticas.tiempoTotal / this.estadisticas.validaciones,
        tasaError: (this.estadisticas.errores / this.estadisticas.validaciones) * 100,
      },
    };
  }

  // Limpiar cachés
  public limpiarCaches(): void {
    this.engine.clearCaches();
    this.logger.info('Cachés limpiados');
  }

  // Mostrar resultado de validación
  private mostrarResultado<T extends Record<string, any>>(
    tipo: string,
    resultado: ValidraResult<T>,
    duracion: number,
  ): void {
    const estado = resultado.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO';
    const errores = resultado.errors ? Object.keys(resultado.errors).length : 0;

    this.logger.info(`${estado} - ${tipo}`, {
      válido: resultado.isValid,
      errores,
      tiempo: `${duracion.toFixed(2)}ms`,
    });

    if (!resultado.isValid && resultado.errors) {
      this.logger.warn('Errores encontrados:', resultado.errors);
    }
  }

  // Mostrar estadísticas completas
  public mostrarEstadisticas(): void {
    const metricas = this.obtenerMetricas();

    console.log('\n📊 ESTADÍSTICAS DEL SISTEMA');
    console.log('===========================');

    console.log('\n🔹 Generales:');
    console.log(`   Validaciones: ${this.estadisticas.validaciones}`);
    console.log(`   Errores: ${this.estadisticas.errores}`);
    console.log(`   Tiempo promedio: ${metricas.rendimiento.promedioMs.toFixed(2)}ms`);
    console.log(`   Tasa de error: ${metricas.rendimiento.tasaError.toFixed(1)}%`);

    console.log('\n🔹 Engine:');
    console.log(`   Cache hits: ${metricas.engine.cache.pathCache.hits}`);
    console.log(`   Memory pool hits: ${metricas.engine.memoryPool.hits}`);
    console.log(`   Compilaciones: ${metricas.engine.ruleCompiler.totalCompilations}`);
  }

  // Demostración completa
  public async ejecutarDemostracion(): Promise<void> {
    console.log('\n🚀 DEMOSTRACIÓN VALIDRA');
    console.log('======================');

    // Datos de prueba
    const usuarioValido: Usuario = {
      id: 1,
      nombre: 'Ana García',
      email: 'ana@empresa.com',
      edad: 28,
      estado: 'activo',
    };

    const usuarioInvalido: Usuario = {
      id: 2,
      nombre: '',
      email: 'email-invalido',
      edad: 15,
      estado: 'activo',
    };

    // 1. Validación Síncrona
    console.log('\n1️⃣ Validación Síncrona');
    console.log('----------------------');
    this.validarUsuario(usuarioValido);
    this.validarUsuario(usuarioInvalido);

    // 2. Validación Asíncrona
    console.log('\n2️⃣ Validación Asíncrona');
    console.log('-----------------------');
    await this.validarUsuarioAsync(usuarioValido);
    await this.validarUsuarioAsync(usuarioInvalido);

    // 3. Validación en Streaming
    console.log('\n3️⃣ Validación Streaming');
    console.log('-----------------------');
    const loteUsuarios = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      nombre: `Usuario ${i + 1}`,
      email: `usuario${i + 1}@empresa.com`,
      edad: 20 + (i % 40),
      estado: (i % 3 === 0 ? 'activo' : i % 3 === 1 ? 'inactivo' : 'suspendido') as
        | 'activo'
        | 'inactivo'
        | 'suspendido',
    }));

    await this.procesarLoteUsuarios(loteUsuarios);

    // 4. Estadísticas
    console.log('\n4️⃣ Estadísticas');
    console.log('---------------');
    this.mostrarEstadisticas();

    // 5. Gestión de Memoria
    console.log('\n5️⃣ Gestión de Memoria');
    console.log('---------------------');
    this.limpiarCaches();
    console.log('✅ Memoria optimizada');

    console.log('\n🎉 DEMOSTRACIÓN COMPLETADA');
    console.log('=========================');
  }
}

// ========================================
// FUNCIÓN PRINCIPAL
// ========================================

async function main(): Promise<void> {
  console.log('🎯 APLICACIÓN COMPLETA VALIDRA');
  console.log('==============================');

  try {
    const sistema = new SistemaValidacionSimple();
    await sistema.ejecutarDemostracion();

    console.log('\n✅ APLICACIÓN EJECUTADA EXITOSAMENTE');
  } catch (error) {
    console.error('❌ Error en la aplicación:', error);
    process.exit(1);
  }
}

main().catch(console.error);

export { reglasUsuario, SistemaValidacionSimple, Usuario };
