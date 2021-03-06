/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'reflect-metadata';
import * as ts from 'typescript';

import {TypeScriptServiceHost} from '../src/typescript_host';

import {toh} from './test_data';
import {MockTypescriptHost} from './test_utils';


describe('TypeScriptServiceHost', () => {
  it('should be able to create a typescript host', () => {
    const tsLSHost = new MockTypescriptHost(['/app/main.ts'], toh);
    const tsLS = ts.createLanguageService(tsLSHost);
    expect(() => new TypeScriptServiceHost(tsLSHost, tsLS)).not.toThrow();
  });

  it('should be able to analyze modules', () => {
    const tsLSHost = new MockTypescriptHost(['/app/main.ts'], toh);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    expect(ngLSHost.getAnalyzedModules()).toBeDefined();
  });

  it('should be able to analyze modules without a tsconfig.json file', () => {
    const tsLSHost = new MockTypescriptHost(['foo.ts'], toh);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    expect(ngLSHost.getAnalyzedModules()).toBeDefined();
  });

  it('should not throw if there is no script names', () => {
    const tsLSHost = new MockTypescriptHost([], toh);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    expect(() => ngLSHost.getAnalyzedModules()).not.toThrow();
  });

  it('should clear the caches if program changes', () => {
    // First create a TypescriptHost with empty script names
    const tsLSHost = new MockTypescriptHost([], toh);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    expect(ngLSHost.getAnalyzedModules().ngModules).toEqual([]);
    // Now add a script, this would change the program
    const fileName = '/app/main.ts';
    const content = (tsLSHost as MockTypescriptHost).getFileContent(fileName) !;
    (tsLSHost as MockTypescriptHost).addScript(fileName, content);
    // If the caches are not cleared, we would get back an empty array.
    // But if the caches are cleared then the analyzed modules will be non-empty.
    expect(ngLSHost.getAnalyzedModules().ngModules.length).not.toEqual(0);
  });

  it('should throw if getSourceFile is called on non-TS file', () => {
    const tsLSHost = new MockTypescriptHost([], toh);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    expect(() => {
      ngLSHost.getSourceFile('/src/test.ng');
    }).toThrowError('Non-TS source file requested: /src/test.ng');
  });

  it('should be able to find a single inline template', () => {
    const tsLSHost = new MockTypescriptHost(['/app/app.component.ts'], toh);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    const templates = ngLSHost.getTemplates('/app/app.component.ts');
    expect(templates.length).toBe(1);
    const template = templates[0];
    expect(template.source).toContain('<h2>{{hero.name}} details!</h2>');
  });

  it('should be able to find multiple inline templates', () => {
    const tsLSHost = new MockTypescriptHost(['/app/parsing-cases.ts'], toh);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    const templates = ngLSHost.getTemplates('/app/parsing-cases.ts');
    expect(templates.length).toBe(16);
  });

  it('should be able to find external template', () => {
    const tsLSHost = new MockTypescriptHost(['/app/main.ts'], toh);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    ngLSHost.getAnalyzedModules();
    const templates = ngLSHost.getTemplates('/app/test.ng');
    expect(templates.length).toBe(1);
    const template = templates[0];
    expect(template.source).toContain('<h2>{{hero.name}} details!</h2>');
  });
});
