import { FastifyBaseLogger } from "fastify";
import{ FastifyJWTOptions } from "@fastify/jwt";
import { FastifyOAuth2Options } from "@fastify/oauth2";
import { MySQLPromisePool } from "@fastify/mysql";
import { ResultSetHeader } from "mysql2";
import fp from "fastify-plugin";

declare module 'fastify' {
    interface FastifyInstance {
        userService: UserService;
    }
}

export default fp<FastifyOAuth2Options & FastifyJWTOptions>(async (fastify) => {
    fastify.decorate('userService', new UserService(fastify.log, fastify.mysql));
}, {
    name: 'user-service',
    dependencies: [
        '@fastify/mysql'
    ]
});

export class UserService {

    constructor(readonly log: FastifyBaseLogger, readonly mysql: MySQLPromisePool) {}

    async findOrCreateUser(githubUser: any):Promise<number> {
        try {
            const [users] = await this.mysql.query<any[]>(
                `SELECT id FROM sys_users WHERE github_id = ? LIMIT 1`, [githubUser.id]
            );
            const user = users[0];
    
            let userId = user?.id;
            this.log.debug({ stage: 'github-login-callback' }, `Found existing user with ID: ${userId}.`)
        
            // Create a new user if not found.
            if (!user) {
                const [rs] = await this.mysql.query<ResultSetHeader>(
                    `INSERT INTO sys_users(github_id, github_login, email_address) VALUES(?, ?, ?)`,
                    [githubUser.id, githubUser.login, githubUser.email]
                );
                userId = rs.insertId;
                this.log.debug({ stage: 'github-login-callback' }, `Create a new user with ID: ${userId}.`)
            }
            return userId;
        } catch(err) {
            const msg = 'Failed to find or create a user.';
            this.log.error(err, msg);
            throw new Error(msg);
        }
    }
}
