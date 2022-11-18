import { FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwt, { FastifyJWTOptions, FastifyJwtVerifyOptions, JWT, SignOptions, SignPayloadType, UserType, VerifyPayloadType } from "@fastify/jwt";
import fastifyOauth2, { FastifyOAuth2Options, OAuth2Namespace } from '@fastify/oauth2'

import { DateTime } from 'luxon';
import { Octokit } from 'octokit';
import fastifyCookie from "@fastify/cookie";
import fp from 'fastify-plugin';

export default fp<FastifyOAuth2Options & FastifyJWTOptions>(async (fastify) => {
    const enableOauthLogin = fastify.config.GITHUB_OAUTH_CLIENT_ID && fastify.config.GITHUB_OAUTH_CLIENT_SECRET;
    if (enableOauthLogin) {
        const baseURL = fastify.config.API_BASE_URL || 'http://localhost:3450';
        const jwtSecret = fastify.config.JWT_SECRET || 'localhost';
        const cookieName = fastify.config.JWT_COOKIE_NAME || 'o-token';
        const cookieDomainName = fastify.config.JWT_COOKIE_DOMAIN || 'localhost';
        const cookieSecure = Boolean(fastify.config.JWT_COOKIE_SECURE);
        const cookieSameSite = Boolean(fastify.config.JWT_COOKIE_SAME_SITE);

        await fastify.register(fastifyCookie);
        await fastify.register<FastifyJWTOptions>(fastifyJwt, {
            secret: jwtSecret,
            cookie: {
                cookieName: cookieName,
                signed: true,
            },
        });
        await fastify.register<FastifyOAuth2Options>(fastifyOauth2, {
            name: 'githubOauth2',
            scope: ['user:email'],
            credentials: {
              client: {
                id: fastify.config.GITHUB_OAUTH_CLIENT_ID!,
                secret: fastify.config.GITHUB_OAUTH_CLIENT_SECRET!,
              },
              auth: fastifyOauth2.GITHUB_CONFIGURATION
            },
            startRedirectPath: '/login/github',
            callbackUri: `${baseURL}/login/github/callback`
        });

        // GitHub oauth2 callback.
        fastify.get('/login/github/callback', {}, async function (request, reply) { 
            const { token } = await this.githubOauth2.getAccessTokenFromAuthorizationCodeFlow(request);
            const accessToken = token.access_token;
            this.log.debug({ stage: 'github-login-callback' }, `Got access token: ${accessToken}.`)

            const githubClient = new Octokit({ auth: accessToken });
            const { data: githubUser } = await githubClient.rest.users.getAuthenticated();

            // Try to find existing user in the database.
            const userId = await fastify.userService.findOrCreateUser(githubUser);
            const payload = {
                userId: userId,
                githubId: githubUser.id,
                githubLogin: githubUser.login,
                githubEmail: githubUser.email
            };
            const signingToken = await reply.jwtSign(
                payload,
                {
                    expiresIn: "7d",
                }
            );

            reply
                .setCookie(cookieName, signingToken, {
                    domain: cookieDomainName,
                    path: '/',
                    secure: cookieSecure, // Send cookie over HTTPS only.
                    httpOnly: true,
                    expires: DateTime.now().plus({ days: 7 }).toJSDate(),
                    sameSite: cookieSameSite // For CSRF protection.
                })
                .code(200)
                .send({
                    success: true,
                    payload
                });
        });

        // Authentication.
        fastify.decorate("authenticate", async function (request: FastifyRequest, response: FastifyReply) {
            try {
                await request.jwtVerify();
            } catch (err) {
                response.send(err);
            }
        });
    }
})
  
declare module 'fastify' {
    interface FastifyInstance {
        githubOauth2: OAuth2Namespace;
        authenticate: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
        jwt: JWT;
    }

    interface FastifyReply {
        jwtSign(payload: SignPayloadType, options?: Partial<SignOptions>): Promise<string>
    }

    interface FastifyRequest {
        jwtVerify<Decoded extends VerifyPayloadType>(options?: FastifyJwtVerifyOptions): Promise<Decoded>
        user: UserType
    }
}
