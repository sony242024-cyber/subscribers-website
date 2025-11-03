/**
 * Tests for pages/api/admin/pick-random.js
 */
const handler = require('../../../pages/api/admin/pick-random').default;

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@prisma/client', () => {
  const $queryRaw = jest.fn();
  const PrismaClient = function () {
    return { $queryRaw };
  };
  PrismaClient.$queryRaw = $queryRaw;
  return { PrismaClient };
});

const { getServerSession } = require('next-auth/next');
const { PrismaClient } = require('@prisma/client');

function createRes() {
  const res = {};
  res.statusCode = 200;
  res.headers = {};
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.setHeader = jest.fn((k, v) => {
    res.headers[k] = v;
  });
  res.json = jest.fn((body) => {
    res.body = body;
    return res;
  });
  return res;
}

function setAuthSession(email) {
  getServerSession.mockResolvedValueOnce(email ? { user: { email } } : {});
}

function mockPrismaQueryRaw(result) {
  PrismaClient.$queryRaw.mockResolvedValueOnce(result);
}

describe('API: /api/admin/pick-random', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 405 for non-POST methods', async () => {
    setAuthSession('admin@example.com');
    const req = { method: 'GET' };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  test('returns 401 when not authenticated', async () => {
    setAuthSession(null);
    const req = { method: 'POST' };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  test('returns 200 with handles array when query succeeds', async () => {
    setAuthSession('user@example.com');
    const req = { method: 'POST' };
    const res = createRes();

    mockPrismaQueryRaw([
      { youtubeHandle: 'user1' },
      { youtubeHandle: 'user2' },
      { youtubeHandle: 'user3' },
    ]);

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ handles: ['user1', 'user2', 'user3'] });
  });

  test('returns 200 with empty handles when query returns empty', async () => {
    setAuthSession('user@example.com');
    const req = { method: 'POST' };
    const res = createRes();

    mockPrismaQueryRaw([]);

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ handles: [] });
  });

  test('returns 500 on prisma error', async () => {
    setAuthSession('user@example.com');
    const req = { method: 'POST' };
    const res = createRes();

    PrismaClient.$queryRaw.mockRejectedValueOnce(new Error('[TEST_ALLOW_ERROR] db failed'));

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
