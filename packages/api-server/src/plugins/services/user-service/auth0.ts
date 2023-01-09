import Axios from "axios";

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
  aud: string[];
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

export async function fetchAuth0UserInfo(
  domain: string,
  token: string
): Promise<Auth0UserInfo> {
  // https://auth0.com/docs/api/authentication#get-user-info
  const URL = `https://${domain}/userinfo`;
  const bearerToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  const response = await Axios.get(URL, {
    headers: {
      Authorization: bearerToken,
    },
  }).then((res) => res.data);
  return response as Auth0UserInfo;
}
