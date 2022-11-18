import { eraseToken, OctokitFactory, SYMBOL_TOKEN } from '../../../../src/core/executor/octokit-executor/OctokitFactory';
import { Octokit } from 'octokit';
import { testLogger } from '../../../helpers/log';

describe('eraseToken()', () => {
  it('should erase token', () => {
    expect(eraseToken('1234567890')).toBe('****34567890');
    expect(eraseToken('xxxewaiofn32n1234567890')).toBe('****34567890');
    expect(eraseToken(undefined)).toBe('anonymous');
  });
});

describe('class OctokitFactory', () => {
  const tokens = ['fake1'];
  const factory = new OctokitFactory(tokens, testLogger);
  let _value: Octokit | undefined;
  it('should create octokit', async () => {
    let value = await factory.create();
    expect(value).toBeInstanceOf(Octokit);
    expect(value).toMatchObject({
      [SYMBOL_TOKEN]: 'fake1',
    });
    _value = value;
  });

  it('should failed to create object when tokens empty', async () => {
    await expect(factory.create()).rejects.toBe('Out of personal tokens');
  });

  it('should reuse tokens', async () => {
    await factory.destroy(_value!);
    expect(factory.create()).resolves.toMatchObject({
      [SYMBOL_TOKEN]: 'fake1',
    });
  });

  it('should create anonymous token when undefined provided', async () => {
    const factory = new OctokitFactory([undefined], testLogger);
    expect(factory.create()).resolves.toMatchObject({
      [SYMBOL_TOKEN]: undefined,
    });
  });
});

