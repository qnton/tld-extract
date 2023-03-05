'use strict';

const url = require('url');

const parse_url = function (remote_url, options = {}) {
  if (typeof remote_url === 'string') remote_url = url.parse(remote_url);
  return parse_host(remote_url.hostname, options);
};

let tlds = null;

const parse_host = function (
  host,
  {
    allowPrivateTLD = false,
    allowUnknownTLD = false,
    allowDotlessTLD = false,
  } = {},
) {
  if (!host) {
    throw new Error('Host parameter is null or undefined.');
  }

  if (!tlds) {
    tlds = require('./../src/assets/effective_tld_names.json');
    tlds.combined = Object.assign({}, tlds.icann, tlds.private);
  }

  const parts = host.split('.');
  let stack = '';
  let tld_level = -1;

  const roots = allowPrivateTLD ? tlds.combined : tlds.icann;

  for (let i = parts.length - 1, part; i >= 0; i--) {
    part = parts[i];
    stack = stack ? `${part}.${stack}` : part;
    if (roots[stack]) tld_level = roots[stack];
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
    tld: parts.slice(-tld_level).join('.'),
    domain: parts.slice(-tld_level - 1).join('.'),
    sub: parts.slice(0, -tld_level - 1).join('.'),
  };
};

module.exports = parse_url;
module.exports.parse_host = parse_host;
