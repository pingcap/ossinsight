import fp from "fastify-plugin";
import {APIError} from '../../utils/error';
import '../../utils/http/request-audit';
import FastifyAuth0 from "fastify-auth0-verify";

export interface Auth0UserInfo {
    sub: string;
    nickname: string;
    name: string;
    picture: string;
    updated_at: string;
    email: string;
    email_verified: boolean;
}

export const AUTH0_NAMESPACE = `https://ossinsight.io`;
export const AUTH0_USER_METADATA = `${AUTH0_NAMESPACE}/metadata`;

export type Auth0UserMetadata = {
    email: string;
    github_id?: string;
    github_login?: string;
    provider: string;
};

export interface Auth0User {
    "https://ossinsight.io/metadata": Auth0UserMetadata;
    iss: string;
    sub: string;
    aud: string | string[];
    iat: number;
    exp: number;
    azp: string;
    scope: string;
}

export function parseAuth0User(user: Auth0User) {
    const { ["https://ossinsight.io/metadata"]: metadata, ...others } = user;
    return {
        ...others,
        metadata,
    };
}

export default fp(async (app) => {
    const secret = app.config.AUTH0_SECRET;
    if (secret && /-----BEGIN [A-Z ]*(?:KEY|CERTIFICATE)-----/.test(secret)) {
        throw new Error('AUTH0_SECRET must be a symmetric client secret; use AUTH0_DOMAIN for public-key verification.');
    }
    const audience = app.config.AUTH0_AUDIENCE?.trim();
    const clientIds = new Set((app.config.AUTH0_ALLOWED_CLIENT_IDS || []).map(value => value.trim()).filter(Boolean));
    const domain = app.config.AUTH0_DOMAIN;
    const issuer = domain ? new URL(domain.includes('://') ? domain : `https://${domain}`).toString() : undefined;
    if (issuer && !issuer.startsWith('https://')) throw new Error('AUTH0_DOMAIN must use HTTPS.');
    if (issuer && (audience === `${issuer}api/v2/` || audience === `${issuer}userinfo`)) {
        throw new Error('AUTH0_AUDIENCE must identify this API, not the Auth0 Management or UserInfo API.');
    }
    const algorithms = new Set([
        ...(app.config.AUTH0_DOMAIN ? ['RS256', 'EdDSA'] : []),
        ...(secret ? ['HS256'] : []),
    ]);
    await app.register(FastifyAuth0, {
        domain: app.config.AUTH0_DOMAIN,
        secret: app.config.AUTH0_SECRET,
        audience,
        issuer,
    });
    const verify = app.authenticate.bind(app);
    app.authenticate = async (request, reply) => {
        // Reject unsupported algorithms/extensions before the verifier chooses a
        // key source. This is only a rejection gate; signature verification below
        // remains mandatory before assigning an authenticated identity.
        let header: {alg?: unknown; crit?: unknown};
        try {
            const token = /^Bearer\s+(\S+)$/i.exec(request.headers.authorization || '')?.[1];
            if (!token || token.split('.').length !== 3) throw new Error();
            header = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString('utf8'));
            if (!header || typeof header !== 'object' || Array.isArray(header) ||
                typeof header.alg !== 'string' || !algorithms.has(header.alg) || 'crit' in header) throw new Error();
        } catch {
            throw new APIError(401, 'Invalid authorization token.');
        }
        // An omitted audience must never silently enable tenant-wide tokens.
        // Keep anonymous analytics available while protected routes fail closed.
        if (!audience) throw new APIError(503, 'Authentication is not configured.');
        await verify(request, reply);
        const claims = request.user as {sub?: unknown; aud?: unknown; azp?: unknown; exp?: unknown};
        const audiences = typeof claims?.aud === 'string' ? [claims.aud]
            : Array.isArray(claims?.aud) && claims.aud.every(value => typeof value === 'string') ? claims.aud : [];
        const sub = claims?.sub;
        if (typeof sub !== 'string' || !sub || sub.length > 256 || !audiences.includes(audience) ||
            typeof claims.exp !== 'number' || !Number.isFinite(claims.exp) ||
            (clientIds.size > 0 && (typeof claims.azp !== 'string' || !clientIds.has(claims.azp)))) {
            throw new APIError(401, 'Invalid authenticated identity.');
        }
        // Only assign an audit actor after signature verification succeeds.
        request.securityActor = `auth0:${sub}`;
    };
}, {
    name: '@ossinsight/auth0',
    dependencies: [
        '@fastify/env'
    ],
});
