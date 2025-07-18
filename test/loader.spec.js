/* global describe, it */
const chai = require('chai');
const sinonChai = require('sinon-chai');
const { spy } = require('sinon');
const { readFileSync } = require('fs');
const loader = require('../');
const { VERSION } = require('svelte/compiler');

const isSvelte5Plus = Number(VERSION.split('.')[0]) >= 5;

chai.use(sinonChai);
const { expect } = chai;

function d([str]) {
	return str.replace(/^\t+/gm, '').replace(/\r/g, '').trim();
}

describe('loader', () => {
	function testLoader(fileName, callback, query, version = 2) {
		return done => {
			const addedDependencies = new Set();

			function cb(...args) {
				while (args.length < 4) {
					args.push(undefined);
				}
				args.push(addedDependencies);
				try {
					callback(...args);
				} catch (err) {
					expect(callbackSpy).to.have.been.called;
					return done(err);
				}
				expect(callbackSpy).to.have.been.called;
				done();
			}

			const fileContents = readFile(fileName);

			const cacheableSpy = spy(function() {});

			const callbackSpy = spy(cb);

			const dependencySpy = spy(function(p) { addedDependencies.add(p); });

			loader.call(
				{
					cacheable: cacheableSpy,
					async: () => callbackSpy,
					addDependency: dependencySpy,
					resourcePath: fileName,
					version,
					query,
					emitWarning: () => {}
				},
				fileContents,
				null
			);

			expect(cacheableSpy).to.have.been.called;

			for (const call of dependencySpy.getCalls()) {
				expect(call.firstArg).to.be.a('string');
			}
		};
	}

	it(
		'should compile',
		testLoader('test/fixtures/good.html', function(err, code, map) {
			expect(err).not.to.exist;
			expect(code).to.exist;
			expect(map).to.exist;
		})
	);

	describe('error handling', () => {
		it(
			'should handle parse error',
			testLoader('test/fixtures/parse-error.html', function(
				err,
				code,
				map,
			) {
				expect(err).to.exist;

				if (isSvelte5Plus) {
					expect(err.message).to.eql(d`
						CompileError: block_unexpected_close: Unexpected block closing tag
						https://svelte.dev/e/block_unexpected_close
						test/fixtures/parse-error.html:1:22
						1: <p>Count: {count}</p>{/if}
						                         ^`);
				} else {
					expect(err.message).to.eql(d`
						ParseError: Unexpected block closing tag (1:23)
						1: <p>Count: {count}</p>{/if}
						                          ^`);
				}

				expect(code).not.to.exist;
				expect(map).not.to.exist;
			})
		);

		it(
			'should handle validation error',
			testLoader('test/fixtures/validation-error.html', function(
				err,
				code,
				map,
			) {
				expect(err).to.exist;

				if (isSvelte5Plus) {
					expect(err.message.trim().replace(/\r/g, '')).to.eql(d`
						CompileError: module_illegal_default_export: A component cannot have a default export
						https://svelte.dev/e/module_illegal_default_export
						test/fixtures/validation-error.html:2:1
						1: <script>
						2:   export default {};
						                       ^
						3: </script>
						4:`);
				} else {
					expect(err.message.trim().replace(/\r/g, '')).to.eql(d`
						ValidationError: A component cannot have a default export (2:1)
						1: <script>
						2:   export default {};
						     ^
						3: </script>
						4:`);
				}

				expect(code).not.to.exist;
				expect(map).not.to.exist;
			})
		);
	});

	describe('ES2015 features', () => {
		it(
			'should keep imports / methods',
			testLoader('test/fixtures/es2015.html', function(err, code, map) {
				expect(err).not.to.exist;

				expect(code).to.exist;
				expect(map).to.exist;

				// es2015 statements remain
				expect(code).to.contain(`import { hello } from './utils';`);
			})
		);

		it(
			'should keep nested Component import',
			testLoader('test/fixtures/parent.html', function(err, code, map) {
				expect(err).not.to.exist;

				// es2015 statements remain
				expect(code).to.contain(`import Nested from './nested';`);

				expect(code).to.exist;
				expect(map).to.exist;
			})
		);
	});

	describe('configuration via query', () => {
		describe('css', () => {
			it(
				'should configure css (default)',
				testLoader('test/fixtures/css.html', function(err, code, map) {
					expect(err).not.to.exist;
					if (isSvelte5Plus) {
						expect(code).to.contain('$.append_styles');
					} else {
						expect(code).to.contain('function add_css(target)');
					}
				})
			);

			it(
				'should configure no css',
				testLoader(
					'test/fixtures/css.html',
					function(err, code, map) {
						expect(err).not.to.exist;
						if (isSvelte5Plus) {
							expect(code).not.to.contain('$.append_styles');
						} else {
							expect(code).not.to.contain('function add_css(target)');
						}
					},
					{ compilerOptions: { css: 'external' } }
				)
			);

			it(
				'should configure css with dev sourcemaps',
				testLoader(
					'test/fixtures/css.html',
					function(err, code, map) {
						expect(err).not.to.exist;
						if (isSvelte5Plus) {
							expect(code).to.contain('$.append_styles');
						} else {
							expect(code).to.contain('function add_css(target)');
						}
						expect(code).to.contain('/*# sourceMappingURL=');
						expect(map).to.exist;
					},
					{ compilerOptions: { dev: true, enableSourcemap: true } }
				)
			);

			it(
				'should configure css without dev sourcemaps',
				testLoader(
					'test/fixtures/css.html',
					function(err, code, map) {
						// This compiler option is removed in Svelte 5+, sourcemaps are always generated
						if (isSvelte5Plus) return;

						expect(err).not.to.exist;
						expect(code).to.contain('function add_css(target)');
						expect(code).not.to.contain('/*# sourceMappingURL=');
						expect(map).to.exist;
					},
					{ compilerOptions: { dev: true, enableSourcemap: { css: false, js: true } } }
				)
			);
		});

		describe('sveltePath', () => {
			// This option is removed in Svelte 5+
			if (isSvelte5Plus) return;

			it(
				'should configure sveltePath',
				testLoader(
					'test/fixtures/good.html',
					function(err, code, map) {
						expect(err).not.to.exist;

						expect(code).to.contain('import {');
						expect(code).to.contain('custom-svelte/internal');
					},
					{ compilerOptions: { sveltePath: 'custom-svelte' } }
				)
			);
		});

		describe('generate', () => {
			it(
				'should configure generate=undefined (default)',
				testLoader('test/fixtures/good.html', function(err, code, map) {
					expect(err).not.to.exist;

					expect(code).not.to.contain(
						'.render = function(state, options = {}) {'
					);
				})
			);

			it(
				'should configure generate=ssr',
				testLoader(
					'test/fixtures/good.html',
					function(err, code, map) {
						expect(err).not.to.exist;
						if (isSvelte5Plus) {
							expect(code).to.contain('$$payload.out');
						} else {
							expect(code).to.contain('create_ssr_component');
						}
					},
					{ compilerOptions: { generate: isSvelte5Plus ? 'server' : 'ssr' } }
				)
			);
		});

		describe('emitCss', function() {
			it(
				'should configure emitCss=false (default)',
				testLoader(
					'test/fixtures/css.html',
					function(err, code, map) {
						expect(err).not.to.exist;

						expect(code).not.to.match(/require\('.+\.css'\);/);
					},
					{}
				)
			);

			it(
				'should configure emitCss=true',
				testLoader(
					'test/fixtures/css.html',
					function(err, code, map) {
						expect(err).not.to.exist;

						expect(code).to.match(/!=!svelte-loader\?cssPath=/);
					},
					{ emitCss: true }
				)
			);

			it(
				'should configure emitCss=true without css sourcemaps',
				testLoader(
					'test/fixtures/css.html',
					function(err, code, map) {
						expect(err).not.to.exist;

						expect(code).to.match(/!=!svelte-loader\?cssPath=/);
					},
					{ emitCss: true, compilerOptions: { enableSourcemap: { css: false, js: true } } }
				)
			);
		});

		describe('preprocess', () => {
			it('should preprocess successfully', done => {
				testLoader(
					'test/fixtures/style-valid.html',
					(err, code, map) => {
						expect(err).not.to.exist;
						expect(code).to.exist;
						expect(code).to.contain('{width:50px;height:50px');
						expect(map).to.exist;
					},
					{
						preprocess:{
							style: ({ content }) => {
								return {
									code: content.replace(/\$size/gi, '50px')
								};
							}
						}
					}
				)(done);
			});

			it('should not preprocess successfully', done => {
				testLoader(
					'test/fixtures/style-valid.html',
					(err, code, map, context, addedDependencies) => {
						expect(err).to.exist;
						expect(addedDependencies).to.include('/some/subresource.css');
					},
					{
						preprocess: {
							style: () => {
								const e = new Error('Error while preprocessing');
								e.filename = '/some/subresource.css';
								throw e;
							}
						}
					}
				)(done);
			});
		});

		describe('hotReload', () => {
			// Svelte 5+ doesn't support hot reload currently
			if (isSvelte5Plus) return;

			it(
				'should configure hotReload=false (default)',
				testLoader(
					'test/fixtures/good.html',
					function(err, code, map) {
						expect(err).not.to.exist;

						expect(code).not.to.contain('module && module.hot');
					},
					{}
				)
			);

			it(
				'should configure hotReload=true',
				testLoader(
					'test/fixtures/good.html',
					function(err, code, map) {
						expect(err).not.to.exist;

						expect(code).to.contain('module && module.hot');
						expect(code).not.to.contain('"preserveLocalState":true');
					},
					{ hotReload: true }
				)
			);

			it(
				'should configure hotReload=true & hotOptions',
				testLoader(
					'test/fixtures/good.html',
					function(err, code, map) {
						expect(err).not.to.exist;

						expect(code).to.contain('module && module.hot');
						expect(code).to.contain('"preserveLocalState":true');
					},
					{
						hotReload: true,
						hotOptions: {
							preserveLocalState: true
						}
					}
				)
			);

			it(
				'should ignore hotReload when generate=ssr',
				testLoader(
					'test/fixtures/good.html',
					function(err, code, map) {
						expect(err).not.to.exist;

						expect(code).not.to.contain('module && module.hot');
					},
					{
						hotReload: true,
						compilerOptions: { generate: 'ssr' }
					}
				)
			);

			it(
				'should require resolved hot-api.js',
				testLoader(
					'test/fixtures/good.html',
					function(err, code, map) {
						expect(err).not.to.exist;

						expect(code).to.contain('lib/hot-api.js');
					},
					{ hotReload: true }
				)
			);
		});

		describe('compilerOptions', () => {
			it(
				'should configure enableSourcemap=false',
				testLoader(
					'test/fixtures/good.html',
					function(err, code, map) {
						// The compiler option is removed in Svelte 5+, sourcemaps are always generated
						if (isSvelte5Plus) return;

						expect(err).not.to.exist;
						expect(code).to.exist;
						expect(map).not.to.exist;
					},
					{ compilerOptions: { enableSourcemap: false } }
				),
			);
		});
	});

	describe('Svelte 5', () => {
		if (!isSvelte5Plus) return;

		it(
			'should compile .svelte.js',
			testLoader(
				'test/fixtures/file.svelte.js',
				function(err, code, map) {
					expect(err).not.to.exist;

					expect(code).not.to.contain('$state');
				},
				{}
			)
		);

		it(
			'should compile .svelte.foo.ts',
			testLoader(
				'test/fixtures/file.svelte.foo.ts',
				function(err, code, map) {
					expect(err).not.to.exist;

					expect(code).not.to.contain('$state');
				},
				{}
			)
		);
	});
});

function readFile(path) {
	return readFileSync(path, 'utf-8');
}
