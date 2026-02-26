import assert from "node:assert/strict";
import { describe, it } from "node:test";
import parseUrl, { parse_host } from "../src/index.js";

describe("Main test suite", () => {
	it("should test parsing", () => {
		assert.deepEqual(parseUrl("http://www.google.com"), {
			tld: "com",
			domain: "google.com",
			sub: "www",
		});
		assert.deepEqual(parseUrl("http://free.fr"), {
			tld: "fr",
			domain: "free.fr",
			sub: "",
		});
		assert.deepEqual(parseUrl("http://google.co.uk"), {
			tld: "co.uk",
			domain: "google.co.uk",
			sub: "",
		});

		assert.deepEqual(parseUrl("http://bar.www.google.co.uk"), {
			tld: "co.uk",
			domain: "google.co.uk",
			sub: "bar.www",
		});
		assert.deepEqual(
			parseUrl("https://google.co.uk:8081/api/thing?q=something"),
			{
				tld: "co.uk",
				domain: "google.co.uk",
				sub: "",
			},
		);

		assert.throws(() => parseUrl("http://nowhere"), /Invalid TLD/);
		assert.throws(() => parseUrl("http://nowhere.local"), /Invalid TLD/);

		assert.deepEqual(
			parseUrl("http://nowhere.local", { allowUnknownTLD: true }),
			{
				tld: "local",
				domain: "nowhere.local",
				sub: "",
			},
		);
		assert.deepEqual(
			parseUrl(new URL("http://nowhere.local"), { allowUnknownTLD: true }),
			{
				tld: "local",
				domain: "nowhere.local",
				sub: "",
			},
		);
	});

	it("should test private TLDs", () => {
		const aws_url =
			"http://ec2-23-20-71-128.compute-1.amazonaws.com/news/uk-news/2020/04/14/life-on-the-inside-10-ways-to-ease-an-anxious-mind-during-lockdown/";
		assert.deepEqual(parseUrl(aws_url), {
			tld: "com",
			domain: "amazonaws.com",
			sub: "ec2-23-20-71-128.compute-1",
		});

		assert.deepEqual(
			parseUrl("http://jeanlebon.notaires.fr/", { allowPrivateTLD: true }),
			{
				tld: "notaires.fr",
				domain: "jeanlebon.notaires.fr",
				sub: "",
			},
		);

		assert.deepEqual(parseUrl("http://jeanlebon.cloudfront.net"), {
			tld: "net",
			domain: "cloudfront.net",
			sub: "jeanlebon",
		});
		assert.deepEqual(
			parseUrl("http://jeanlebon.cloudfront.net", { allowPrivateTLD: true }),
			{
				tld: "cloudfront.net",
				domain: "jeanlebon.cloudfront.net",
				sub: "",
			},
		);
	});

	it("should allow non strict tld rules", () => {
		assert.throws(() => parseUrl("http://co.uk/"), /Invalid TLD/);
		assert.deepEqual(parseUrl("http://co.uk/", { allowDotlessTLD: true }), {
			tld: "co.uk",
			domain: "co.uk",
			sub: "",
		});
	});

	it("should test for subdomains with hyphens", () => {
		assert.deepEqual(parseUrl("https://blog-example.google.com"), {
			tld: "com",
			domain: "google.com",
			sub: "blog-example",
		});
	});

	it("should test for URLs with username and password", () => {
		assert.deepEqual(parseUrl("http://user:password@example.com"), {
			tld: "com",
			domain: "example.com",
			sub: "",
		});
	});

	it("should test for subdomains with numbers", () => {
		assert.deepEqual(parseUrl("https://2022.news.example.com"), {
			tld: "com",
			domain: "example.com",
			sub: "2022.news",
		});
	});

	it("should test for URLs with a path", () => {
		assert.deepEqual(parseUrl("http://example.com/path/to/file.html"), {
			tld: "com",
			domain: "example.com",
			sub: "",
		});
	});

	it("should test for URLs with a query string", () => {
		assert.deepEqual(parseUrl("http://example.com/search?q=term"), {
			tld: "com",
			domain: "example.com",
			sub: "",
		});
	});

	it("should test for URLs with a fragment identifier", () => {
		assert.deepEqual(parseUrl("http://example.com#section1"), {
			tld: "com",
			domain: "example.com",
			sub: "",
		});
	});

	it("should test the host function", () => {
		assert.deepEqual(parse_host("mail.from.google.com"), {
			tld: "com",
			domain: "google.com",
			sub: "mail.from",
		});
	});
});
