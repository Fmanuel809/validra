// Generador de datos de prueba para tests de performance
export function generateTestData(count: number, complex = false) {
  if (!complex) {
    return Array.from({ length: count }, (_, i) => ({
      email: `user${i}@example.com`,
      age: 18 + (i % 60),
      name: `Nombre${i}`,
    }));
  }
  // Datos complejos: 20 campos variados
  return Array.from({ length: count }, (_, i) => ({
    email: `user${i}@example.com`,
    age: 18 + (i % 60),
    name: `Nombre${i}`,
    address: `Calle ${i} #${i * 2}`,
    phone: `555-000${i}`,
    isActive: i % 2 === 0,
    created: new Date(Date.now() - i * 1000000),
    updated: new Date(Date.now() - i * 500000),
    score: Math.random() * 100,
    tags: [`tag${i % 5}`, `tag${(i + 1) % 5}`],
    meta: { a: i, b: i * 2 },
    notes: `Nota ${i}`,
    country: `País${i % 10}`,
    zip: 10000 + (i % 90000),
    verified: i % 3 === 0,
    ref: `REF${i}`,
    type: i % 4 === 0 ? 'A' : 'B',
    balance: Math.random() * 10000,
    children: Array.from({ length: i % 3 }, (_, j) => ({ id: j, name: `Hijo${j}` })),
    extra: { foo: i, bar: i * 3 },
  }));
}

export default generateTestData;
