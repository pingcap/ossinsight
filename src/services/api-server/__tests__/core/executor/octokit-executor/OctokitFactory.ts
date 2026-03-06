import { OctokitFactory } from '../../../../src/core/executor/octokit-executor/OctokitFactory';
import { Octokit } from 'octokit';
import {SYMBOL_TOKEN} from "../../../../src/utils/octokit";
import { testLogger } from '../../../helpers/log';

describe('class OctokitFactory', () => {
  const tokens = ['fake1'];
  const factory = new OctokitFactory(tokens, testLogger);
  let _value: Octokit | undefined;
  test('should create octokit', async () => {
    let value = await factory.create();
    expect(value).toBeInstanceOf(Octokit);
    expect(value).toMatchObject({
      [SYMBOL_TOKEN]: 'fake1',
    });
    _value = value;
  });

  test('should failed to create object when tokens empty', async () => {
    await expect(factory.create()).rejects.toBe('Out of use of GitHub personal access tokens.');
  });

  test('should reuse tokens', async () => {
    await factory.destroy(_value!);
    expect(factory.create()).resolves.toMatchObject({
      [SYMBOL_TOKEN]: 'fake1',
    });
  });

  test('should create anonymous token when undefined provided', async () => {
    const factory = new OctokitFactory([undefined], testLogger);
    expect(factory.create()).resolves.toMatchObject({
      [SYMBOL_TOKEN]: undefined,
    });
  });
});

