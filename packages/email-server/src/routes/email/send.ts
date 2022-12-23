import { FastifyPluginAsync } from 'fastify';
import React from 'react';
import RepoMilestoneFeeds, { RepoMilestoneFeedsProps } from '../../emails/RepositoryFeeds';
import sendMail from '../../emails';
import { EmailTemplateNames, SendEmailPayload } from '../../client';

const schema = {
  body: {
    type: 'object',
    properties: {
      to: { type: 'string' },
      subject: { type: 'string' },
      templateName: { type: 'string' },
      templateData: { type: 'object' },
    },
  },
};

const send: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.post<{
    Body: SendEmailPayload;
  }>('/', {
    schema,
  }, async function (req, reply) {
    const {
      to, subject, templateName, templateData,
    } = req.body;

    let component = null;
    switch (templateName) {
      case EmailTemplateNames.REPO_FEEDS:
        component = React.createElement(RepoMilestoneFeeds, templateData as RepoMilestoneFeedsProps);
        break;
      default:
        throw new Error(`Unknown template name: ${String(templateName)}`);
    }

    await sendMail({
      subject,
      to,
      component,
    });

    void reply.send({ success: true });
  });
};

export default send;
