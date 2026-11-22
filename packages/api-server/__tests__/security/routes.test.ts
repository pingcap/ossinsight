import Fastify from 'fastify';
import playground from '../../src/routes/playground/sql/generate';
import legacy from '../../src/routes/bot/questionToSQL';

describe.each([['playground',playground],['legacy bot',legacy]])('%s generation route', (_name, route) => {
  async function app(provider = 'google') {
    const app = Fastify();
    app.decorate('authenticate', async (request: any) => {
      request.user = {'https://ossinsight.io/metadata': {provider, github_id:provider==='github'?'7':undefined, github_login:provider==='github'?'real-user':undefined}};
    });
    app.decorate('userService',{getUserIdOrCreate:async()=>1});
    app.decorate('config',{});
    app.decorate('playgroundService',{
      reserveQuestion:async()=>({id:1,used:1}),checkIfTrustedUser:async()=>false,finishQuestion:async()=>{},
    });
    const generate = jest.fn().mockResolvedValue('SELECT 1 LIMIT 100');
    app.decorate('botService',{questionToSQL:generate});
    await app.register(route as any);
    return {app,generate};
  }
  test.each([undefined, {}, {repo_id:0}, {repo_id:-1}])('refuses invalid/missing repo context %s',async context=>{
    const instance=await app();
    try {
      const res=await instance.app.inject({method:'POST',url:'/',payload:{question:'stats',context}});
      expect(res.statusCode).toBe(400);
      expect(instance.generate).not.toHaveBeenCalled();
    } finally {await instance.app.close();}
  });
  test.each(['google','github'])('uses only verified %s identity',async provider=>{
    const instance=await app(provider);
    try {
      const res=await instance.app.inject({method:'POST',url:'/',payload:{question:'my PRs',context:{repo_id:42,github_id:999,github_login:'victim',question:'override'}}});
      expect(res.statusCode).toBe(200);
      const context=instance.generate.mock.calls[0][2];
      expect(context).toEqual(provider==='github'?{repo_id:42,github_id:7,github_login:'real-user'}:{repo_id:42});
      expect(instance.generate.mock.calls[0][1]).toBe('my PRs');
    } finally {await instance.app.close();}
  });
});
