/* global describe, it */

const chai = require('chai');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

const expect = chai.expect;

const { spy } = require('sinon');

const { readFileSync } = require('fs');

const loader = require('../');


describe('loader', function() {

  function testLoader(fileName, callback, query) {

    return function() {

      const cacheableSpy = spy(function() { });

      const callbackSpy = spy(callback);

      const fileContents = readFile(fileName);

      loader.call({
        cacheable: cacheableSpy,
        callback: callbackSpy,
        filename: fileName,
        query: query,
      }, fileContents, null);

      expect(callbackSpy).to.have.been.called;
      expect(cacheableSpy).to.have.been.called;
    };
  }


  it('should compile good',
    testLoader('test/fixtures/good.html', function(err, code, map) {
      expect(err).not.to.exist;

      expect(code).to.exist;
      expect(map).to.exist;
    })
  );


  it('should compile bad',
    testLoader('test/fixtures/bad.html', function(err, code, map) {
      expect(err).to.exist;

      expect(code).not.to.exist;
      expect(map).not.to.exist;
    })
  );


  it('should compile with import / ES2015 features',
    testLoader('test/fixtures/es2015.html', function(err, code, map) {
      expect(err).not.to.exist;

      expect(code).to.exist;
      expect(map).to.exist;

      // es2015 statements remain
      expect(code).to.contain('import { hello } from \'./utils\';');
      expect(code).to.contain('data() {');
    })
  );


  it('should compile Component with nesting',
    testLoader('test/fixtures/parent.html', function(err, code, map) {
      expect(err).not.to.exist;

      // es2015 statements remain
      expect(code).to.contain('import Nested from \'./nested\';');

      expect(code).to.exist;
      expect(map).to.exist;
    })
  );


  it('should compile Component to CJS if requested',
    testLoader('test/fixtures/good.html', function(err, code, map) {
      expect(err).not.to.exist;
      expect(code).to.contain('module.exports = SvelteComponent;');
    }, { format: 'cjs' })
  );


  it('should compile Component to UMD if requested',
    testLoader('test/fixtures/good.html', function(err, code, map) {
      expect(err).not.to.exist;
      expect(code).to.contain('(global.FooComponent = factory());');
    }, { format: 'umd', name: 'FooComponent' })
  );

  it('should compile Component with css by default',
    testLoader('test/fixtures/css.html', function(err, code, map) {
      expect(err).not.to.exist;
      expect(code).to.contain('if ( !addedCss ) addCss();');
    })
  );

  it('should compile Component without css if requested',
    testLoader('test/fixtures/css.html', function(err, code, map) {
      expect(err).not.to.exist;
      expect(code).not.to.contain('if ( !addedCss ) addCss();');
    }, { css: false })
  );

});


function readFile(path) {
  return readFileSync(path, 'utf-8');
}
