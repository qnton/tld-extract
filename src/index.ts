import tldsList from "./assets/effective_tld_names.json" with { type: "json" };

export interface ParseOptions {
	/**
	 * Allow parsing URLs that contain the TLDs specified under the "private" property
	 * in the effective_tld_names.json file.
	 */
	allowPrivateTLD?: boolean;
	/**
	 * Allow parsing URLs that contain TLDs that are not in the effective_tld_names.json file.
	 *
	 * @note This option can also be used when parsing URLs that contain IP addresses.
	 */
	allowUnknownTLD?: boolean;
	/**
	 * Allow parsing URLs that contain dotless TLDs.
	 */
	allowDotlessTLD?: boolean;
}

export interface ParseResult {
	tld: string;
	domain: string;
	sub: string;
}

const tlds = tldsList as {
	icann: Record<string, number>;
	private: Record<string, number>;
	combined: Record<string, number>;
};

export function parse_host(
	host: string,
	options: ParseOptions = {},
): ParseResult {
	const {
		allowPrivateTLD = false,
		allowUnknownTLD = false,
		allowDotlessTLD = false,
	} = options;

	if (!host) {
		throw new Error("Host parameter is null or undefined.");
	}

	const parts = host.split(".");
	let stack = "";
	let tld_level = -1;

	const roots = allowPrivateTLD ? tlds.combined : tlds.icann;

	for (let i = parts.length - 1; i >= 0; i--) {
		const part = parts[i];
		if (part === undefined) continue;

		stack = stack ? `${part}.${stack}` : part;

		const level = roots[stack];
		if (level !== undefined) {
			tld_level = level;
		}
	}

	if (tld_level === -1 && allowUnknownTLD) tld_level = 1;

	if (parts.length <= tld_level || tld_level === -1) {
		if (!(parts.length === tld_level && allowDotlessTLD)) {
			throw new Error(
				`Invalid TLD ${JSON.stringify({ parts, tld_level, allowUnknownTLD })}`,
			);
		}
	}

	return {
		tld: parts.slice(-tld_level).join("."),
		domain: parts.slice(-tld_level - 1).join("."),
		sub: parts.slice(0, -tld_level - 1).join("."),
	};
}

export default function parse_url(
	remote_url: string | URL,
	options: ParseOptions = {},
): ParseResult {
	let hostname: string;
	if (typeof remote_url === "string") {
		hostname = new URL(remote_url).hostname;
	} else {
		hostname = remote_url.hostname;
	}
	return parse_host(hostname, options);
}
