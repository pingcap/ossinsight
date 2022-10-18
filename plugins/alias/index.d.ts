import { Plugin } from "@docusaurus/types";
declare type AliasPluginOptions = import('webpack').Configuration['resolve']['alias'];
export default function AliasPlugin(_: any, options: AliasPluginOptions): Plugin;
export {};
