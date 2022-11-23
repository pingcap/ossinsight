import { bootstrapTestContainer, releaseTestContainer } from '../helpers/db';
import { bootstrapApp, getTestApp, releaseApp } from '../helpers/app';
import '../../src/services/user-service';

beforeEach(bootstrapTestContainer);
beforeEach(bootstrapApp);
afterEach(releaseApp);
afterEach(releaseTestContainer);

const user1 = {
  id: 1,
  login: 'test1',
  email: 'test1@example.com',
};

const user2 = {
  id: 2,
  login: 'test1',
  email: 'test1@example.com',
};

const COUNT_SQL = 'SELECT count(*) as count from sys_users';

describe('findOrCreateUser', () => {
  test('should create user', async () => {
    const db = await bootstrapTestContainer();
    const service = getTestApp().app.userService;

    (await db.expect(COUNT_SQL)).toEqual([{ count: 0 }]);

    const id = await service.findOrCreateUser(user1);
    (await db.expect(COUNT_SQL)).toEqual([{ count: 1 }]);

    expect(await service.findOrCreateUser(user1)).toBe(id);
    (await db.expect(COUNT_SQL)).toEqual([{ count: 1 }]);

    expect(await service.findOrCreateUser(user2)).not.toBe(id);
    (await db.expect(COUNT_SQL)).toEqual([{ count: 2 }]);
  });
});
