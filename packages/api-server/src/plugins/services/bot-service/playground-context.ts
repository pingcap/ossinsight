import { Auth0User } from '../../auth/auth0';
import { positiveId } from '../../../core/playground/sql-policy';

// The request selects public repository data. It never supplies identity.
export function buildPlaygroundContext(input: Record<string, unknown> | undefined, user: Auth0User) {
  const context: { repo_id: number; github_id?: number; github_login?: string } = {
    repo_id: positiveId(input?.repo_id),
  };
  const metadata = user?.['https://ossinsight.io/metadata'];
  if (metadata?.provider === 'github' && metadata.github_id) {
    context.github_id = positiveId(metadata.github_id);
    if (metadata.github_login && /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/.test(metadata.github_login)) {
      context.github_login = metadata.github_login;
    }
  }
  return context;
}
