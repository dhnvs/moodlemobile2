// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Injectable } from '@angular/core';
import { CoreLoggerProvider } from './logger';

export interface CorePluginFileHandler {
    name: string; // Name of the handler.
    getComponentRevisionRegExp?(args: string[]): RegExp; // Should return the RegExp to match revision on pluginfile url.
    getComponentRevisionReplace?(args: string[]): string; // Should return the String to remove the revision on pluginfile url.
};

/**
 * Delegate to register pluginfile information handlers.
 */
@Injectable()
export class CorePluginFileDelegate {
    protected logger;
    protected handlers: {[s: string]: CorePluginFileHandler} = {};

    constructor(logger: CoreLoggerProvider) {
        this.logger = logger.getInstance('CorePluginFileDelegate');
    }

    /**
     * Get the handler for a certain pluginfile url.
     *
     * @param {string} pluginType Type of the plugin.
     * @return {CorePluginFileHandler} Handler. Undefined if no handler found for the plugin.
     */
    protected getPluginHandler(pluginType: string) : CorePluginFileHandler {
        if (typeof this.handlers[pluginType] != 'undefined') {
            return this.handlers[pluginType];
        }
    }

    /**
     * Get the RegExp of the component and filearea described in the URL.
     *
     * @param {string[]} args Arguments of the pluginfile URL defining component and filearea at least.
     * @return {RegExp}  RegExp to match the revision or undefined if not found.
     */
    getComponentRevisionRegExp(args: string[]) : RegExp {
        // Get handler based on component (args[1]).
        const handler = this.getPluginHandler(args[1]);

        if (handler && handler.getComponentRevisionRegExp) {
            return handler.getComponentRevisionRegExp(args);
        }
    }

    /**
     * Register a handler.
     *
     * @param {CorePluginFileHandler} handler The handler to register.
     * @return {boolean} True if registered successfully, false otherwise.
     */
    registerHandler(handler: CorePluginFileHandler) : boolean {
        if (typeof this.handlers[handler.name] !== 'undefined') {
            this.logger.log(`Addon '${handler.name}' already registered`);
            return false;
        }
        this.logger.log(`Registered addon '${handler.name}'`);
        this.handlers[handler.name] = handler;
        return true;
    }

    /**
     * Removes the revision number from a file URL.
     *
     * @param {string} url URL to be replaced.
     * @param {string[]} args Arguments of the pluginfile URL defining component and filearea at least.
     * @return {string} Replaced URL without revision.
     */
    removeRevisionFromUrl(url: string, args: string[]) : string {
        // Get handler based on component (args[1]).
        const handler = this.getPluginHandler(args[1]);

        if (handler && handler.getComponentRevisionRegExp && handler.getComponentRevisionReplace) {
            const revisionRegex = handler.getComponentRevisionRegExp(args);
            if (revisionRegex) {
                return url.replace(revisionRegex, handler.getComponentRevisionReplace(args));
            }
        }

        return url;
    }
}