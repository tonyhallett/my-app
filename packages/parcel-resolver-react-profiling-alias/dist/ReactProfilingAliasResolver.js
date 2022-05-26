"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = require("@parcel/plugin");
const node_resolver_core_1 = __importDefault(require("@parcel/node-resolver-core"));
const reactDom = 'react-dom';
const schedulerTracing = 'scheduler/tracing';
const logOrigin = 'ReactProfilingAliasResolver';
function createDiagnosticWithOrigin(message) {
    return {
        message,
        origin: logOrigin
    };
}
const shouldLog = true;
function logResolveResult(logger, resolved, dependency) {
    if (shouldLog) {
        logger.log(createDiagnosticWithOrigin(`parent - ${dependency.resolveFrom}`));
        if (resolved) {
            logger.log(createDiagnosticWithOrigin(`resolved ${dependency.specifier} ${JSON.stringify(resolved)}`));
        }
        else {
            logger.log(createDiagnosticWithOrigin(`failed to resolve ${dependency.specifier}`));
        }
    }
}
function shouldProfile(specifier) {
    return process.env.REACT_PROFILING !== undefined && (specifier === reactDom || specifier === schedulerTracing);
}
exports.default = new plugin_1.Resolver({
    async resolve(arg) {
        const { specifier, dependency, options } = arg;
        const logger = arg.logger;
        if (shouldProfile(specifier)) {
            const resolver = new ReactAliasingNodeResolver({
                fs: options.inputFS,
                projectRoot: options.projectRoot,
                // Extensions are always required in URL dependencies.
                extensions: dependency.specifierType === 'commonjs' ||
                    dependency.specifierType === 'esm'
                    ? ['ts', 'tsx', 'js', 'jsx', 'json']
                    : [],
                mainFields: ['source', 'browser', 'module', 'main'],
                packageManager: options.shouldAutoInstall
                    ? options.packageManager
                    : undefined,
                logger,
            });
            const resolved = await resolver.resolve({
                filename: specifier,
                specifierType: dependency.specifierType,
                parent: dependency.resolveFrom,
                env: dependency.env,
                sourcePath: dependency.sourcePath,
                loc: dependency.loc,
            });
            logResolveResult(logger, resolved, dependency);
            return resolved;
        }
        if (shouldLog && (specifier === reactDom || specifier === schedulerTracing)) {
            logger.log(createDiagnosticWithOrigin('Did not profile react ****************************************'));
        }
        return null;
    }
});
class ReactAliasingNodeResolver extends node_resolver_core_1.default {
    constructor(opts) {
        super(opts);
    }
    async loadAlias(_filename, _sourceFile, _env, _ctx) {
        const resolved = _filename == reactDom ? 'react-dom/profiling' : 'scheduler/tracing-profiling';
        return {
            type: 'file',
            sourcePath: '',
            resolved
        };
    }
}
