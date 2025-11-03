// Silence console.error during tests unless explicitly testing it
const originalError = console.error;
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const msg = args.join(' ');
    if (msg.includes('[TEST_ALLOW_ERROR]')) {
      return originalError(...args);
    }
  });
});

afterAll(() => {
  console.error.mockRestore();
});
