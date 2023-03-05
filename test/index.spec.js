'use strict';

var expect = require('expect.js');
var parse = require('../src');
var { parse_host } = require('../src');
var url = require('url');

describe('Main test suite', function () {
  it('should test parsing', function () {
    expect(parse('http://www.google.com')).to.eql({
      tld: 'com',
      domain: 'google.com',
      sub: 'www',
    });
    expect(parse('http://free.fr')).to.eql({
      tld: 'fr',
      domain: 'free.fr',
      sub: '',
    });
    expect(parse('http://google.co.uk')).to.eql({
      tld: 'co.uk',
      domain: 'google.co.uk',
      sub: '',
    });

    expect(parse('http://bar.www.google.co.uk')).to.eql({
      tld: 'co.uk',
      domain: 'google.co.uk',
      sub: 'bar.www',
    });
    expect(parse('https://google.co.uk:8081/api/thing?q=something')).to.eql({
      tld: 'co.uk',
      domain: 'google.co.uk',
      sub: '',
    });

    expect(parse.bind(null, 'http://nowhere')).to.throwException(/Invalid TLD/);
    expect(parse.bind(null, 'http://nowhere.local')).to.throwException(
      /Invalid TLD/,
    );

    expect(parse('http://nowhere.local', { allowUnknownTLD: true })).to.eql({
      tld: 'local',
      domain: 'nowhere.local',
      sub: '',
    });
    expect(
      parse(url.parse('http://nowhere.local'), { allowUnknownTLD: true }),
    ).to.eql({ tld: 'local', domain: 'nowhere.local', sub: '' });
  });

  it('should test private TLDs', function () {
    let aws_url =
      'http://ec2-23-20-71-128.compute-1.amazonaws.com/news/uk-news/2020/04/14/life-on-the-inside-10-ways-to-ease-an-anxious-mind-during-lockdown/';
    expect(parse(aws_url)).to.eql({
      tld: 'com',
      domain: 'amazonaws.com',
      sub: 'ec2-23-20-71-128.compute-1',
    });

    expect(parse('http://jeanlebon.notaires.fr/')).to.eql({
      tld: 'notaires.fr',
      domain: 'jeanlebon.notaires.fr',
      sub: '',
    });

    expect(parse('http://jeanlebon.cloudfront.net')).to.eql({
      tld: 'net',
      domain: 'cloudfront.net',
      sub: 'jeanlebon',
    });
    expect(
      parse('http://jeanlebon.cloudfront.net', { allowPrivateTLD: true }),
    ).to.eql({
      tld: 'cloudfront.net',
      domain: 'jeanlebon.cloudfront.net',
      sub: '',
    });
  });

  it('should allow non strict tld rules', function () {
    expect(() => parse('http://notaires.fr/')).to.throwException(/Invalid TLD/);
    expect(parse('http://notaires.fr/', { allowDotlessTLD: true })).to.eql({
      tld: 'notaires.fr',
      domain: 'notaires.fr',
      sub: '',
    });
  });

  it('should test for subdomains with hyphens', function () {
    expect(parse('https://blog-example.google.com')).to.eql({
      tld: 'com',
      domain: 'google.com',
      sub: 'blog-example',
    });
  });

  it('should test for subdomains with numbers', function () {
    expect(parse('https://2022.news.example.com')).to.eql({
      tld: 'com',
      domain: 'example.com',
      sub: '2022.news',
    });
  });

  it('should test for URLs with username and password', function () {
    expect(parse('http://user:password@example.com')).to.eql({
      tld: 'com',
      domain: 'example.com',
      sub: '',
    });
  });

  it('should test for subdomains with numbers', function () {
    expect(parse('https://2022.news.example.com')).to.eql({
      tld: 'com',
      domain: 'example.com',
      sub: '2022.news',
    });
  });

  it('should test for URLs with a path', function () {
    expect(parse('http://example.com/path/to/file.html')).to.eql({
      tld: 'com',
      domain: 'example.com',
      sub: '',
    });
  });

  it('should test for URLs with a query string', function () {
    expect(parse('http://example.com/search?q=term')).to.eql({
      tld: 'com',
      domain: 'example.com',
      sub: '',
    });
  });

  it('should test for URLs with a fragment identifier', function () {
    expect(parse('http://example.com#section1')).to.eql({
      tld: 'com',
      domain: 'example.com',
      sub: '',
    });
  });

  it('should test the host function', function () {
    expect(parse_host('mail.from.google.com')).to.eql({
      tld: 'com',
      domain: 'google.com',
      sub: 'mail.from',
    });
  });
});
