import {eraseToken} from "../../../../src/utils/octokit";

describe('eraseToken()', () => {
  test('should erase token', () => {
    expect(eraseToken('1234567890')).toBe('****34567890');
    expect(eraseToken('xxxewaiofn32n1234567890')).toBe('****34567890');
    expect(eraseToken(undefined)).toBe('anonymous');
  });
});