/* global describe, it */
const chai = require('chai');
const sinonChai = require('sinon-chai');
const { spy } = require('sinon');
const { readFileSync } = require('fs');
const loader = require('../');

chai.use(sinonChai);
const { expect } = chai;

function d([str]) {
	return str.replace(/^\t+/gm, '').trim();
}

describe('loader', () => {
	function testLoader(fileName, callback, query, version = 2) {
		return done => {
			function cb() {
				try {
					callback(...[].slice.call(arguments));
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

			loader.call(
				{
					cacheable: cacheableSpy,
					async: () => callbackSpy,
					resourcePath: fileName,
					version,
					query
				},
				fileContents,
				null
			);

			expect(cacheableSpy).to.have.been.called;
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
				context
			) {
				expect(err).to.exist;

				expect(err.message).to.eql(d`
					ParseError: Unexpected block closing tag (1:23)
					1: <p>Count: {count}</p>{/if}
					                          ^`);

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
				context
			) {
				expect(err).to.exist;

				expect(err.message.trim()).to.eql(d`
					ValidationError: A component cannot have a default export (2:1)
					1: <script>
					2:   export default {};
					     ^
					3: </script>
					4:`);

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
				expect(code).to.contain(`import { hello } from "./utils";`);
			})
		);

		it(
			'should keep nested Component import',
			testLoader('test/fixtures/parent.html', function(err, code, map) {
				expect(err).not.to.exist;

				// es2015 statements remain
				expect(code).to.contain(`import Nested from "./nested";`);

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
					expect(code).to.contain('function add_css()');
				})
			);

			it(
				'should configure no css',
				testLoader(
					'test/fixtures/css.html',
					function(err, code, map) {
						expect(err).not.to.exist;
						expect(code).not.to.contain('function add_css()');
					},
					{ css: false }
				)
			);
		});

		describe('sveltePath', () => {
			it(
				'should configure sveltePath',
				testLoader(
					'test/fixtures/good.html',
					function(err, code, map) {
						expect(err).not.to.exist;

						expect(code).to.contain('import {');
						expect(code).to.contain('custom-svelte/internal');
					},
					{ sveltePath: 'custom-svelte' }
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

						expect(code).to.contain('create_ssr_component');
					},
					{ generate: 'ssr' }
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

						expect(code).to.match(/import '.+\.css';/);
					},
					{ emitCss: true }
				)
			);
		});

		describe('preprocess', () => {
			it('should preprocess successfully', done => {
				function callback(err, code, map) {
					expect(err).not.to.exist;
					expect(code).to.exist;
					expect(code).to.contain('{width:50px;height:50px}');
					expect(map).to.exist;
				}

				function cb() {
					try {
						callback(...[].slice.call(arguments));
					} catch (err) {
						expect(callbackSpy).to.have.been.called;
						return done(err);
					}
					expect(callbackSpy).to.have.been.called;
					done();
				}

				const fileContents = readFileSync(
					'test/fixtures/style-valid.html',
					'utf-8'
				);
				const cacheableSpy = spy(() => {});
				const callbackSpy = spy(cb);
				const options = {
					preprocess: {
						style: ({ content }) => {
							return {
								code: content.replace(/\$size/gi, '50px')
							};
						}
					}
				};

				loader.call(
					{
						cacheable: cacheableSpy,
						async: () => callbackSpy,
						resourcePath: 'test/fixtures/style-valid.html',
						options
					},
					fileContents,
					null
				);

				expect(cacheableSpy).to.have.been.called;
			});

			it('should not preprocess successfully', () => {
				const fileContents = readFileSync(
					'test/fixtures/style-valid.html',
					'utf-8'
				);
				const cacheableSpy = spy(() => {});
				const options = {
					preprocess: {
						style: () => {
							throw new Error('Error while preprocessing');
						}
					}
				};

				loader.call(
					{
						cacheable: cacheableSpy,
						async: () => err => {
							expect(err).to.exist;
						},
						resourcePath: 'test/fixtures/style-valid.html',
						options
					},
					fileContents,
					null
				);
			});
		});

		describe('deprecations', () => {
			it('should warn on options.style', done => {
				const { warn } = console;
				const warnings = [];

				console.warn = msg => {
					warnings.push(msg);
				};

				testLoader(
					'test/fixtures/style-valid.html',
					(err, code, map) => {
						expect(code).to.contain('50px');
						expect(warnings).to.deep.equal([
							'[svelte-loader] DEPRECATION: options.style is now options.preprocess.style'
						]);
						console.warn = warn;
					},
					{
						style: ({ content }) => {
							return {
								code: content.replace(/\$size/gi, '50px')
							};
						}
					}
				)(done);
			});
		});

		describe('hotReload', () => {
			it(
				'should configure hotReload=false (default)',
				testLoader(
					'test/fixtures/good.html',
					function(err, code, map) {
						expect(err).not.to.exist;

						expect(code).not.to.contain('module.hot.accept();');
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

						expect(code).to.contain('module.hot.accept();');
						expect(code).not.to.contain('configure({"noPreserveState":true});');
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

						expect(code).to.contain('module.hot.accept();');
						expect(code).to.contain('configure({"noPreserveState":true});');
					},
					{
						hotReload: true,
						hotOptions: {
							noPreserveState: true
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

						expect(code).not.to.contain('module.hot.accept();');
					},
					{
						hotReload: true,
						generate: 'ssr'
					}
				)
			);

			it(
				'should require resolved hot-api.js',
				testLoader(
					'test/fixtures/good.html',
					function(err, code, map) {
						expect(err).not.to.exist;

						expect(code).to.contain(require.resolve('../lib/hot-api.js').replace(/[/\\]/g, '/'));
					},
					{ hotReload: true }
				)
			);
		});
	});
});

function readFile(path) {
	return readFileSync(path, 'utf-8');
}
