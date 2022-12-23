import fp from "fastify-plugin";
import {EmailClient} from "@ossinsight/email-server";

export default fp(async (app) => {
    const emailClient = new EmailClient(app.config.EMAIL_SERVER_URL);
    await app.decorate("emailClient", emailClient);
}, {
    name: '@ossinsight/email-client',
    dependencies: [
        '@fastify/env',
    ],
});
