import App from "koa";
import { Consola } from "consola";

export interface ContextExtends extends App.DefaultContext {
    logger: Consola;
}  

export interface GitHubAuthOption {
    enableGitHubLogin: boolean;
    jwtSecret: string;
    cookieName: string;
    clientId: string;
    clientSecret: string;
    successCallback: string;
    errorCallback: string;
  }