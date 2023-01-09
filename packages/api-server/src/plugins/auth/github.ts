// import {FastifyReply, FastifyRequest, FastifySchema} from 'fastify';
// import fastifyJwt, {
//     FastifyJWTOptions,
//     FastifyJwtVerifyOptions,
//     JWT,
//     SignOptions,
//     SignPayloadType,
//     VerifyPayloadType
// } from "@fastify/jwt";
// import fastifyOauth2, {FastifyOAuth2Options, OAuth2Namespace} from '@fastify/oauth2'

// import {DateTime} from 'luxon';
// import fastifyCookie from "@fastify/cookie";
// import fp from 'fastify-plugin';
// import {ProviderType, UserProfile, UserRole} from "../services/user-service";
// import {APIError} from "../../utils/error";
// import {getOctokit} from "../../utils/octokit";

// export const callbackSchema: FastifySchema = {
//     querystring: {
//         type: 'object',
//         required: ['code'],
//         properties: {
//             code: {
//                 type: 'string',
//             }
//         }
//     },
//     response: {
//         200: {
//             type: 'object',
//             required: ["success", "profile"],
//             properties: {
//                 success: {
//                     type: 'boolean'
//                 },
//                 profile: {
//                     type: 'object',
//                     properties: {
//                         id: { type: 'number' },
//                         name: { type: 'string' },
//                         emailAddress: { type: 'string' },
//                         emailGetUpdates: { type: 'boolean' },
//                         githubId: { type: 'number' },
//                         githubLogin: { type: 'string' },
//                         avatarURL: { type: 'string' },
//                         role: { type: 'string', enum: ['user', 'admin'] },
//                         createdAt: { type: 'string' }
//                     }
//                 }
//             }
//         }
//     }
// };

// export default fp<FastifyOAuth2Options & FastifyJWTOptions>(async (app) => {
//     const enableOauthLogin = app.config.GITHUB_OAUTH_CLIENT_ID && app.config.GITHUB_OAUTH_CLIENT_SECRET;
//     const baseURL = app.config.API_BASE_URL || 'http://localhost:3450';
//     const jwtSecret = app.config.JWT_SECRET || 'localhost';
//     const cookieName = app.config.JWT_COOKIE_NAME || 'o-token';
//     const cookieDomainName = app.config.JWT_COOKIE_DOMAIN || 'localhost';
//     const cookieSecure = Boolean(app.config.JWT_COOKIE_SECURE);
//     const cookieSameSite = Boolean(app.config.JWT_COOKIE_SAME_SITE);

//     await app.register(fastifyCookie);
//     await app.register<FastifyJWTOptions>(fastifyJwt, {
//         secret: jwtSecret,
//         cookie: {
//             cookieName: cookieName,
//             signed: false,
//         },
//     });

//     // Forbidden all requests need authenticated when oauth login is disabled.
//     if (!enableOauthLogin) {
//         app.decorate("authenticate", async function (request: FastifyRequest, response: FastifyReply) {
//             await response.status(401).send({
//                 message: 'Unauthorized'
//             });
//         });
//         return;
//     }

//     await app.register<FastifyOAuth2Options>(fastifyOauth2, {
//         name: 'githubOauth2',
//         scope: ['user:email'],
//         credentials: {
//           client: {
//             id: app.config.GITHUB_OAUTH_CLIENT_ID!,
//             secret: app.config.GITHUB_OAUTH_CLIENT_SECRET!,
//           },
//           auth: fastifyOauth2.GITHUB_CONFIGURATION
//         },
//         startRedirectPath: '/login/github',
//         callbackUri: `${baseURL}/login/github/callback`,
//     });

//     // Authentication verify handler.
//     app.decorate("authenticate", async function (req: FastifyRequest, reply: FastifyReply) {
//         try {
//             await req.jwtVerify();
//         } catch (err: any) {
//             throw new APIError(401, 'Unauthorized', err);
//         }
//     });

//     app.decorate("authenticateAllowAnonymous", async function (req: FastifyRequest, reply: FastifyReply) {
//         if (req.cookies[cookieName]) {
//             try {
//                 await req.jwtVerify();
//             } catch (err: any) {
//                 throw new APIError(401, 'Unauthorized', err);
//             }
//         }
//     });

//     // GitHub oauth2 callback.
//     app.get('/login/github/callback', {
//         schema: callbackSchema,
//     }, async function (request, reply) {
//         const log = this.log.child({ stage: 'github-oauth2-callback' });
//         const { token } = await this.githubOauth2.getAccessTokenFromAuthorizationCodeFlow(request);
//         const accessToken = token.access_token;
//         log.debug(`Got access token: ${accessToken}.`);

//         if (!accessToken) {
//             throw new APIError(401, 'Failed to get access token, please log in again.');
//         }

//         // Get user profile.
//         const githubClient = getOctokit(accessToken, log);
//         const { data: githubUser } = await githubClient.rest.users.getAuthenticated();

//         // Get user email.
//         const { data: emails } = await githubClient.rest.users.listEmailsForAuthenticatedUser();
//         const emailAddress = getPrimaryEmail(emails);
//         if (!emailAddress) {
//             log.warn('Failed to get email of user %s.', githubUser.login);
//         }

//         // Create or update user.
//         const user = {
//             name: githubUser.name || githubUser.login,
//             emailAddress: emailAddress,
//             // User is not allowed to get updates by default.
//             emailGetUpdates: false,
//             avatarURL: githubUser.avatar_url,
//             role: UserRole.USER,
//             createdAt: DateTime.utc().toJSDate(),
//             enable: true,
//         };
//         const account = {
//             provider: ProviderType.GITHUB,
//             providerAccountId: githubUser.id.toString(),
//             providerAccountLogin: githubUser.login,
//             accessToken: accessToken,
//         }
//         const userId = await app.userService.findOrCreateUserByAccount(user, account);
//         const userProfile = await app.userService.getUserById(userId);

//         // Generate JWT token and set it to cookie.
//         const signingToken = await reply.jwtSign(
//             {
//                 ...userProfile,
//                 accessToken: accessToken,
//             },
//             {
//                 expiresIn: "7d",
//             }
//         );

//         const cookieExpires = DateTime.now().plus({ days: 7 }).toJSDate();
//         reply
//             .setCookie(cookieName, signingToken, {
//                 domain: cookieDomainName,
//                 path: '/',
//                 secure: cookieSecure, // Send cookie over HTTPS only.
//                 httpOnly: false,
//                 expires: cookieExpires,
//                 sameSite: cookieSameSite // For CSRF protection.
//             })
//             .code(200)
//             .header('Content-Type', 'text/html; charset=utf-8')
//             .send('<script>close();</script>');
//     });

//     // Logout.
//     app.get('/logout', {
//         preHandler: [app.authenticate]
//     },async function (request, reply) {
//        reply
//            .clearCookie(cookieName, {
//                domain: cookieDomainName,
//                path: '/',
//                secure: cookieSecure, // Send cookie over HTTPS only.
//                httpOnly: false,
//                sameSite: cookieSameSite // For CSRF protection.
//            })
//            .code(200)
//            .send({ success: true });
//     });
// });

// function getPrimaryEmail(emails: any[]) {
//     const verifiedEmails = emails
//         .filter((email) => email.verified)
//         // Exclude Github's default noreply email address.
//         .filter((email) => !email.email.includes('@users.noreply.github.com'))
//         // Preferred primary email.
//         .sort((email) => email.primary ? -1 : 1);
//     return verifiedEmails[0]?.email || null;
// }

// declare module "@fastify/jwt" {
//     interface FastifyJWT {
//         payload: UserProfile; // payload type is used for signing and verifying.
//         user: UserProfile; // user type is used for the request object.
//     }
// }

// declare module 'fastify' {
//     interface FastifyInstance {
//         githubOauth2: OAuth2Namespace;
//         authenticate: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
//         authenticateAllowAnonymous: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
//         jwt: JWT;
//     }

//     interface FastifyReply {
//         jwtSign(payload: SignPayloadType, options?: Partial<SignOptions>): Promise<string>
//     }

//     interface FastifyRequest {
//         jwtVerify<Decoded extends VerifyPayloadType>(options?: FastifyJwtVerifyOptions): Promise<Decoded>
//     }
// }
