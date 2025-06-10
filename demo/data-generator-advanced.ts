// Generador de datos avanzados para demos de Validra

export interface DemoUser {
  id: number;
  email: string;
  age: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  created: string;
  updated: string;
  score: number;
  tags: string[];
  meta: { a: number; b: number };
  notes: string;
  country: string;
  zip: number;
  verified: boolean;
  ref: string;
  type: 'A' | 'B';
  balance: number;
  children: { id: number; name: string }[];
  extra: { foo: number; bar: number };
}

// Genera datos válidos e inválidos mezclados
export function generateAdvancedDemoData(count: number, ratioInvalid = 0.1): DemoUser[] {
  return Array.from({ length: count }, (_, i) => {
    const isInvalid = Math.random() < ratioInvalid;
    return {
      id: i + 1,
      email: isInvalid ? `user${i}example.com` : `user${i}@example.com`,
      age: isInvalid ? 10 + (i % 10) : 18 + (i % 60),
      name: isInvalid ? '' : `Nombre${i}`,
      address: isInvalid ? `Avenida ${i}` : `Calle ${i} #${i * 2}`,
      phone: isInvalid ? '000' : `555-000${i}`,
      isActive: i % 2 === 0,
      created: new Date(Date.now() - i * 1000000).toISOString(),
      updated: new Date(Date.now() - i * 500000).toISOString(),
      score: isInvalid ? -5 : Math.random() * 100,
      tags: isInvalid ? [] : [`tag${i % 5}`, `tag${(i + 1) % 5}`],
      meta: { a: i, b: i * 2 },
      notes: isInvalid ? 'N' : `Nota ${i}`.padEnd(10, 'x'),
      country: isInvalid ? '' : `País${i % 10}`,
      zip: isInvalid ? 999999 : 10000 + (i % 90000),
      verified: i % 3 === 0,
      ref: isInvalid ? '' : `REF${i}`,
      type: (i % 4 === 0 ? 'A' : 'B') as 'A' | 'B',
      balance: isInvalid ? -100 : Math.random() * 10000,
      children: Array.from({ length: i % 3 }, (_, j) => ({ id: j, name: `Hijo${j}` })),
      extra: { foo: i, bar: i * 3 },
    };
  });
}

// Genera datos válidos e inválidos mezclados, con logs de progreso y tiempos
export function generateAdvancedDemoDataWithProgress(
  count: number,
  ratioInvalid = 0.1, // Reducido de 0.25 a 0.1 (10% inválidos)
): { data: DemoUser[]; timeMs: number } {
  console.log(`\n[GEN] Iniciando generación de datos (${count} registros)...`);
  const tGen0 = Date.now();
  let genProgress = 0;
  const data = Array.from({ length: count }, (_, i) => {
    if (count >= 100 && i > 0 && i % Math.floor(count / 10) === 0) {
      genProgress += 10;
      console.log(`[GEN] Progreso: ${genProgress}% (${i} registros)`);
    }
    const isInvalid = Math.random() < ratioInvalid;
    return {
      id: i + 1,
      email: isInvalid ? `user${i}example.com` : `user${i}@example.com`,
      age: isInvalid ? 10 + (i % 10) : 18 + (i % 60),
      name: isInvalid ? '' : `Nombre${i}`,
      address: isInvalid ? `Avenida ${i}` : `Calle ${i} #${i * 2}`,
      phone: isInvalid ? '000' : `555-000${i}`,
      isActive: i % 2 === 0,
      created: new Date(Date.now() - i * 1000000).toISOString(),
      updated: new Date(Date.now() - i * 500000).toISOString(),
      score: isInvalid ? -5 : Math.random() * 100,
      tags: isInvalid ? [] : [`tag${i % 5}`, `tag${(i + 1) % 5}`],
      meta: { a: i, b: i * 2 },
      notes: isInvalid ? 'N' : `Nota ${i}`.padEnd(10, 'x'),
      country: isInvalid ? '' : `País${i % 10}`,
      zip: isInvalid ? 999999 : 10000 + (i % 90000),
      verified: i % 3 === 0,
      ref: isInvalid ? '' : `REF${i}`,
      type: (i % 4 === 0 ? 'A' : 'B') as 'A' | 'B',
      balance: isInvalid ? -100 : Math.random() * 10000,
      children: Array.from({ length: i % 3 }, (_, j) => ({ id: j, name: `Hijo${j}` })),
      extra: { foo: i, bar: i * 3 },
    };
  });
  const tGen1 = Date.now();
  console.log('[GEN] Generación de datos finalizada.');
  console.log(`Tiempo de generación de datos: ${((tGen1 - tGen0) / 1000).toFixed(3)} s`);
  return { data, timeMs: tGen1 - tGen0 };
}
