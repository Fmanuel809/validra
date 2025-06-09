/**
 * Common test data fixtures for integration tests.
 * Provides reusable test data sets for different validation scenarios.
 *
 * @category Test Fixtures
 */

export interface TestUser {
  name: string;
  email: string;
  age: number;
}

export interface NestedTestData {
  user: {
    personalInfo: {
      firstName: string;
      lastName: string;
    };
    contact: {
      email: string;
      phone?: string;
    };
    profile: {
      age: number;
      bio?: string;
    };
    roles: string[];
    preferences: {
      notifications: boolean;
      theme: string;
    };
    createdAt: Date;
  };
}

/**
 * Valid test data sets
 */
export const validTestData = {
  basicUser: {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
  } as TestUser,

  userWithMinimalName: {
    name: 'Al',
    email: 'al@example.com',
    age: 25,
  } as TestUser,

  youngUser: {
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 18,
  } as TestUser,

  complexNestedData: {
    user: {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
      },
      contact: {
        email: 'john.doe@example.com',
        phone: '+1234567890',
      },
      profile: {
        age: 28,
        bio: 'Software developer with 5 years of experience',
      },
      roles: ['user', 'admin'],
      preferences: {
        notifications: true,
        theme: 'dark',
      },
      createdAt: new Date('2023-01-15T10:30:00Z'),
    },
  } as NestedTestData,

  partialData: {
    name: 'Partial User',
    email: 'partial@example.com',
    // Missing age field
  },

  arrayData: {
    users: [
      { name: 'User 1', email: 'user1@example.com', age: 25 },
      { name: 'User 2', email: 'user2@example.com', age: 30 },
    ],
    tags: ['javascript', 'typescript', 'testing'],
  },
};

/**
 * Invalid test data sets
 */
export const invalidTestData = {
  invalidEmail: {
    name: 'John Doe',
    email: 'invalid-email',
    age: 30,
  },

  shortName: {
    name: 'A',
    email: 'john@example.com',
    age: 30,
  },

  negativeAge: {
    name: 'John Doe',
    email: 'john@example.com',
    age: -5,
  },

  missingFields: {
    name: 'John Doe',
    // Missing email and age
  },

  wrongTypes: {
    name: 123, // Should be string
    email: true, // Should be string
    age: 'thirty', // Should be number
  },

  multipleErrors: {
    name: 'A', // Too short
    email: 'invalid-email', // Invalid format
    age: -10, // Negative
  },

  emptyData: {},

  nullData: null,

  undefinedData: undefined,

  stringData: 'not an object',

  arrayData: [],

  numberData: 123,

  functionData: () => {},

  dateData: new Date(),
};

/**
 * Performance test data sets
 */
export const performanceTestData = {
  smallDataset: Array.from({ length: 10 }, (_, i) => ({
    name: `User ${i}`,
    email: `user${i}@example.com`,
    age: 20 + i,
  })),

  mediumDataset: Array.from({ length: 100 }, (_, i) => ({
    name: `User ${i}`,
    email: `user${i}@example.com`,
    age: 20 + (i % 50),
  })),

  largeDataset: Array.from({ length: 1000 }, (_, i) => ({
    name: `User ${i}`,
    email: `user${i}@example.com`,
    age: 18 + (i % 60),
  })),

  deeplyNestedData: {
    level1: {
      level2: {
        level3: {
          level4: {
            level5: {
              name: 'Deep User',
              email: 'deep@example.com',
              age: 25,
            },
          },
        },
      },
    },
  },
};

/**
 * Edge case test data
 */
export const edgeCaseTestData = {
  emptyStrings: {
    name: '',
    email: '',
    age: 0,
  },

  whitespaceStrings: {
    name: '   ',
    email: '   @   ',
    age: 25,
  },

  specialCharacters: {
    name: 'Jöhn Döe',
    email: 'jöhn@exämple.com',
    age: 30,
  },

  unicodeEmojis: {
    name: 'John 😀 Doe',
    email: 'john@😀.com',
    age: 30,
  },

  veryLongStrings: {
    name: 'A'.repeat(1000),
    email: `${'a'.repeat(100)}@${'b'.repeat(100)}.com`,
    age: 30,
  },

  boundaryValues: {
    minAge: {
      name: 'Min User',
      email: 'min@example.com',
      age: 0,
    },
    maxAge: {
      name: 'Max User',
      email: 'max@example.com',
      age: 150,
    },
  },
};

/**
 * Streaming test data
 */
export const streamingTestData = {
  chunks: [
    { name: 'Chunk 1', email: 'chunk1@example.com', age: 25 },
    { name: 'Chunk 2', email: 'chunk2@example.com', age: 30 },
    { name: 'Chunk 3', email: 'chunk3@example.com', age: 35 },
  ],

  largeBatch: Array.from({ length: 50 }, (_, i) => ({
    id: i,
    name: `Batch User ${i}`,
    email: `batch${i}@example.com`,
    age: 20 + (i % 40),
  })),
};
