import {createOctokitPool, OctokitBalancer, TOKEN_SYMBOL} from "../src";
import pino from "pino";

describe('octokit pool', () => {

  test('acquire and release should work', async () => {
    const logger = pino();
    const token = 'token 1';
    const pool = createOctokitPool(logger, [token]);

    const octokit = await pool.acquire();
    const descriptor = Object.getOwnPropertyDescriptor(octokit, TOKEN_SYMBOL);
    expect(descriptor).not.toBeUndefined();
    const {value} = descriptor!;
    expect(value).toBe(token);
    expect(pool.available).toBe(0);
    await pool.release(octokit);
    expect(pool.available).toBe(1);
  });

});

describe('octokit balancer', () => {

  test('acquire and release should work', async () => {
    const balancer = new OctokitBalancer(pino(), ["xxx"], [])
    const octokit = await balancer.getOctokit();
    const res = await octokit.rest.users.getAuthenticated();
    console.log(res)
  });

});