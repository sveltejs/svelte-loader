/* global describe, it */

const chai = require('chai');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

const expect = chai.expect;

const { spy } = require('sinon');

const { readFileSync } = require('fs');

const loader = require('../');


describe('loader', function() {

  function testLoader(fileName, callback, query, version = 2) {

    return function() {

      const fileContents = readFile(fileName);

      const cacheableSpy = spy(function() { });

      const callbackSpy = spy(callback);

      loader.call({
        cacheable: cacheableSpy,
        callback: callbackSpy,
        resourcePath: fileName,
        version,
        query,
      }, fileContents, null);

      expect(callbackSpy).to.have.been.called;
      expect(cacheableSpy).to.have.been.called;
    };
  }


  it('should compile',
    testLoader('test/fixtures/good.html', function(err, code, map) {
      expect(err).not.to.exist;

      expect(code).to.exist;
      expect(map).to.exist;
    })
  );


  describe('error handling', function() {

    it('should handle parse error',
      testLoader('test/fixtures/parse-error.html', function(err, code, map, context) {

        expect(err).to.exist;

        expect(err.message).to.eql(
          'Expected }}} (1:18)\n' +
          '1: <p>Count: {{{count}}</p>\n' +
          '                     ^\n' +
          '2: <button on:click=\'set({ count: count + 1 })\'>+1</button>'
        );

        expect(code).not.to.exist;
        expect(map).not.to.exist;
      })
    );


    it('should handle wrong export',
      testLoader('test/fixtures/export-error.html', function(err, code, map, context) {

        expect(err).to.exist;

        expect(err.message).to.eql(
          'Unexpected token (5:7)\n' +
          '3: <script>\n' +
          '4:   export {\n' +
          '5:     foo: \'BAR\'\n' +
          '          ^\n' +
          '6:   };\n' +
          '7: </script>'
        );

        expect(code).not.to.exist;
        expect(map).not.to.exist;
      })
    );


    it('should validation error',
      testLoader('test/fixtures/validation-error.html', function(err, code, map, context) {

        expect(err).to.exist;

        expect(err.message).to.eql(
          'Computed properties can be function expressions or arrow function expressions (6:11)\n' +
          '4:   export default {\n' +
          '5:     computed: {\n' +
          '6:       foo: \'BAR\'\n' +
          '              ^\n' +
          '7:     }\n' +
          '8:   };'
        );

        expect(code).not.to.exist;
        expect(map).not.to.exist;
      })
    );

  });


  describe('ES2015 features', function() {

    it('should keep imports / methods',
      testLoader('test/fixtures/es2015.html', function(err, code, map) {
        expect(err).not.to.exist;

        expect(code).to.exist;
        expect(map).to.exist;

        // es2015 statements remain
        expect(code).to.contain('import { hello } from \'./utils\';');
        expect(code).to.contain('data() {');
      })
    );


    it('should keep nested Component import',
      testLoader('test/fixtures/parent.html', function(err, code, map) {
        expect(err).not.to.exist;

        // es2015 statements remain
        expect(code).to.contain('import Nested from \'./nested\';');

        expect(code).to.exist;
        expect(map).to.exist;
      })
    );

  });


  describe('configuration via query', function() {

    describe('css', function() {

      it('should configure css (default)',
        testLoader('test/fixtures/css.html', function(err, code, map) {
          expect(err).not.to.exist;
          expect(code).to.contain('if ( !addedCss ) addCss();');
        })
      );


      it('should configure no css',
        testLoader('test/fixtures/css.html', function(err, code, map) {
          expect(err).not.to.exist;
          expect(code).not.to.contain('if ( !addedCss ) addCss();');
        }, { css: false })
      );

    });

    describe('shared', function() {

      it('should configure shared=false (default)',
        testLoader('test/fixtures/good.html', function(err, code, map) {
          expect(err).not.to.exist;

          expect(code).not.to.contain('import {');
          expect(code).not.to.contain('svelte/shared.js');
        }, {}, 1)
      );


      it('should configure shared=true',
        testLoader('test/fixtures/good.html', function(err, code, map) {
          expect(err).not.to.exist;

          expect(code).to.contain('import {');
          expect(code).to.contain('svelte/shared.js');
        }, { shared: true })
      );

    });

    describe('generate', function() {

      it('should configure generate=undefined (default)',
        testLoader('test/fixtures/good.html', function(err, code, map) {
          expect(err).not.to.exist;

          expect(code).not.to.contain('.render = function ( root, options ) {');
        })
      );


      it('should configure generate=ssr',
        testLoader('test/fixtures/good.html', function(err, code, map) {
          expect(err).not.to.exist;

          expect(code).to.contain('.render = function ( root, options ) {');
        }, { generate: 'ssr' })
      );

    });

  });

});


function readFile(path) {
  return readFileSync(path, 'utf-8');
}
