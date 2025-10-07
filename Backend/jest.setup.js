

// process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
// process.env.PORT = process.env.PORT || '0'; // use ephemeral port during tests if server starts
// process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// // Avoid connecting to Redis during unit tests by mocking the module when imported.
// jest.mock('./config/redis', () => ({
//   on: jest.fn(),
//   connect: jest.fn(),
// }));


// Silenciar logs globalmente durante las pruebas
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.PORT = process.env.PORT || '0'; // use ephemeral port during tests if server starts
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Avoid connecting to Redis during unit tests by mocking the module when imported.
jest.mock('./config/redis', () => ({
  on: jest.fn(),
  connect: jest.fn(),
}));
