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
		return (done) => {
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

			const cacheableSpy = spy(function() {
			});

			const callbackSpy = spy(cb);

			loader.call({
				cacheable: cacheableSpy,
				async: () => callbackSpy,
				resourcePath: fileName,
				version,
				query,
			}, fileContents, null);

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
					ParseError: Expected }}} (1:18)
					1: <p>Count: {{{count}}</p>
					                     ^
					2: <button on:click='set({ count: count + 1 })'>+1</button>`
					);

				expect(code).not.to.exist;
				expect(map).not.to.exist;
			})
		);

		it(
			'should handle wrong export',
			testLoader('test/fixtures/export-error.html', function(
				err,
				code,
				map,
				context
			) {
				expect(err).to.exist;

				expect(err.message).to.eql(d`
					ParseError: Unexpected token (5:7)
					3: <script>
					4:   export {
					5:     foo: 'BAR'
					          ^
					6:   };
					7: </script>`
					);

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

				expect(err.message).to.eql(d`
					ValidationError: Computed properties can be function expressions or arrow function expressions (6:11)
					4:   export default {
					5:     computed: {
					6:       foo: 'BAR'
					              ^
					7:     }
					8:   };`
					);

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
					expect(code).to.contain('data() {');
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

		describe('shared', () => {
			it(
					'should configure shared=false (default)',
					testLoader(
							'test/fixtures/good.html',
							function(err, code, map) {
								expect(err).not.to.exist;

								expect(code).not.to.contain('import {');
								expect(code).not.to.contain('svelte/shared.js');
							},
							{},
							1
					)
			);

			it(
					'should configure shared=true',
					testLoader(
							'test/fixtures/good.html',
							function(err, code, map) {
								expect(err).not.to.exist;

								expect(code).to.contain('import {');
								expect(code).to.contain('svelte/shared.js');
							},
							{ shared: true }
					)
			);
		});

		describe('generate', () => {
			it(
					'should configure generate=undefined (default)',
					testLoader('test/fixtures/good.html', function(err, code, map) {
						expect(err).not.to.exist;

						expect(code).
								not.
								to.
								contain('.render = function(state, options = {}) {');
					})
			);

			it(
					'should configure generate=ssr',
					testLoader(
							'test/fixtures/good.html',
							function(err, code, map) {
								expect(err).not.to.exist;

								expect(code).
										to.
										contain('.render = function(state, options = {}) {');
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

								expect(code).to.match(/require\('.+\.css'\);/);
							},
							{ emitCss: true }
					)
			);
		});

		describe('preprocess', () => {
			it('should preprocess successfully', (done) => {
				function callback(err, code, map) {
					expect(err).not.to.exist;
					expect(code).to.exist;
					expect(code).to.contain('button{width:50px;height:50px}');
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

				const fileContents = readFileSync('test/fixtures/style-valid.html',
						'utf-8');
				const cacheableSpy = spy(() => {
				});
				const callbackSpy = spy(cb);
				const options = {
					style: ({ content }) => {
						return {
							code: content.replace(/\$size/gi, '50px'),
						};
					},
				};

				loader.call(
					{
						cacheable: cacheableSpy,
						async: () => callbackSpy,
						resourcePath: 'test/fixtures/style-valid.html',
						options,
					},
						fileContents,
						null
				);

				expect(cacheableSpy).to.have.been.called;
			});

			it('should not preprocess successfully', () => {
				const fileContents = readFileSync('test/fixtures/style-valid.html',
						'utf-8');
				const cacheableSpy = spy(() => {
				});
				const options = {
					style: () => {
						throw new Error('Error while preprocessing');
					},
				};

				loader.call(
					{
						cacheable: cacheableSpy,
						async: () => (err) => {
							expect(err).to.exist;
						},
						resourcePath: 'test/fixtures/style-valid.html',
						options,
					},
						fileContents,
						null
				);

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
						generate:'ssr'
					}
				)
			);
		});
	});
});

function readFile(path) {
	return readFileSync(path, 'utf-8');
}
