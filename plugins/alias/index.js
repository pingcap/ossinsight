"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function AliasPlugin(_, options) {
    return {
        name: 'plugin-alias',
        configureWebpack() {
            return {
                resolve: {
                    alias: options,
                },
            };
        },
    };
}
exports.default = AliasPlugin;
