import fp from "fastify-plugin";
import axios from 'axios';
import pino from "pino";
import { ContextProvider } from "./context-provider";

declare module 'fastify' {
    interface FastifyInstance {
        embeddingContextProvider: ContextProvider;
    }
}

export default fp(async (fastify) => {
    const log = fastify.log as pino.Logger;
    let provider: ContextProvider | null = null
    if (fastify.config.EMBEDDING_SERVICE_ENDPOINT) {
        provider = new EmbeddingContextProvider(fastify.config.EMBEDDING_SERVICE_ENDPOINT)
    } else {
        log.info('env EMBEDDING_SERVICE_ENDPOINT not set, embedding context provider will not work.')
    }
    fastify.decorate('embeddingContextProvider', provider);
}, {
  name: '@ossinsight/embedding-context-provider',
  dependencies: [
    '@fastify/env',
  ]
});

interface EmbeddingSearchColumn {
    table: string;
    column: string;
    desc: string;
}

interface EmbeddingSearchEntity {
    name: string;
    desc: string;
}

interface EmbeddingSearchExample {
    Q: string;
    A: string;
}

interface EmbeddingSearchResult {
    columns: EmbeddingSearchColumn[];
    entities: EmbeddingSearchEntity[];
    examples: EmbeddingSearchExample[];
}

class EmbeddingContextProvider implements ContextProvider {
    private readonly endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    async provide(context: Record<string, any>): Promise<Record<string, string>> {
        let question = context['question']
        let r = await axios.post<EmbeddingSearchResult>(this.endpoint + '/prompts', {
            'question': question,
        })

        return {
            'columns': r.data.columns.map(c => c['table'] + '.' + c['column'] + ': ' + c['desc']).join('\n\n'),
            'entities': r.data.entities.map(e => e['desc']).join('\n\n'),
            'examples': r.data.examples.map(e => 'Q: ' + e['Q'] + '\nA: ' + e['A']).join('\n\n'),
            ...context,
        };
    }
}