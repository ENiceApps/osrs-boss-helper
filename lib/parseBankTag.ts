// Parses an OSRS bank-tag export string (the comma-separated id/qty paste) into
// BankContents, supporting both the legacy and newer bank-tag formats and
// throwing BankTagParseError on empty or malformed input. This is the
// manual-paste path for trying the app without the live RuneLite plugin.

import type { BankContents, ItemId } from "@/types/osrs";
import { asItemId } from "@/types/osrs";

export class BankTagParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BankTagParseError";
  }
}

export function parseBankTag(input: string): BankContents {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new BankTagParseError("Bank tag string is empty");
  }

  const parts = trimmed
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (parts.length === 0) {
    throw new BankTagParseError("Bank tag string is empty");
  }

  if (parts[0] === "banktags") {
    return parseNewFormat(parts);
  }

  return parseOldFormat(parts);
}

function parseOldFormat(parts: string[]): BankContents {
  const tagName = parts[0];
  const itemIds = new Set<ItemId>();
  for (let i = 1; i < parts.length; i++) {
    const id = Number(parts[i]);
    if (Number.isInteger(id) && id > 0) {
      itemIds.add(asItemId(id));
    }
  }
  return { tagName, itemIds };
}

function parseNewFormat(parts: string[]): BankContents {
  if (parts.length < 3) {
    throw new BankTagParseError(
      'Malformed "banktags" string: expected at least "banktags,<version>,<name>,..."',
    );
  }

  const version = parts[1];
  if (!/^\d+$/.test(version)) {
    throw new BankTagParseError(
      `Malformed "banktags" string: version "${version}" is not numeric`,
    );
  }

  const tagName = parts[2];
  const itemIds = new Set<ItemId>();
  let i = 3;

  while (i < parts.length) {
    if (parts[i] === "layout") {
      i += 1;
      while (i < parts.length) {
        const id = Number(parts[i]);
        if (Number.isInteger(id) && id > 0) {
          itemIds.add(asItemId(id));
        }
        i += 2;
      }
      break;
    }
    const id = Number(parts[i]);
    if (Number.isInteger(id) && id > 0) {
      itemIds.add(asItemId(id));
    }
    i += 1;
  }

  return { tagName, itemIds };
}
