import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REMOTE_TLD_URL = "https://publicsuffix.org/list/effective_tld_names.dat";
const TLD_CACHE_PATH = path.join(__dirname, "effective_tld_names.dat");
const TLD_CACHE_JSON_PATH = path.join(__dirname, "effective_tld_names.json");

function updateTldCache(callback) {
	const fileStream = fs.createWriteStream(TLD_CACHE_PATH);

	https.get(REMOTE_TLD_URL, (res) => {
		res.pipe(fileStream);
		res.on("end", () => {
			parseTldCache(callback);
		});
	});
}

function parseTldCache(callback) {
	const contents = fs.readFileSync(TLD_CACHE_PATH, "utf-8");

	const sectionRegex = /^\/\/\s*===BEGIN (ICANN|PRIVATE) DOMAINS===\s*$/;
	const commentRegex = /^\/\/.*?/;
	const tldRegex = /^(!|\*\.)?(.+)$/;

	const tlds = {
		icann: {},
		private: {},
		combined: {},
	};

	let currentSection = null;
	const lines = contents.split(/[\r\n]+/);

	for (const line of lines) {
		const trimmedLine = line.trim();

		if (sectionRegex.test(trimmedLine)) {
			currentSection = sectionRegex.exec(trimmedLine)[1].toLowerCase();
			tlds[currentSection] = {};
		} else if (!commentRegex.test(trimmedLine) && tldRegex.test(trimmedLine)) {
			const [, modifier, tld] = tldRegex.exec(trimmedLine);
			let level = tld.split(".").length;

			if (modifier === "*.") {
				level++;
			} else if (modifier === "!") {
				level--;
			}

			tlds[currentSection][tld] = level;
		}
	}

	if (!(tlds.icann && tlds.private)) {
		throw new Error("Error in TLD parser");
	}

	tlds.combined = { ...tlds.icann, ...tlds.private };

	fs.writeFileSync(TLD_CACHE_JSON_PATH, JSON.stringify(tlds, null, 2));
	fs.unlinkSync(TLD_CACHE_PATH);

	callback();
}

updateTldCache(() => {
	console.log("TLD cache has been updated.");
});
