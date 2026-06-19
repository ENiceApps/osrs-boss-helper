"use client";

import { useState } from "react";
import { parseBankTag, BankTagParseError } from "@/lib/parseBankTag";
import type { BankContents } from "@/types/osrs";

interface Props {
  onParsed: (bank: BankContents) => void;
}

export function BankInput({ onParsed }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastTagName, setLastTagName] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState<number | null>(null);

  function handleParse() {
    setError(null);
    try {
      const bank = parseBankTag(value);
      setLastTagName(bank.tagName);
      setItemCount(bank.itemIds.size);
      onParsed(bank);
    } catch (e) {
      if (e instanceof BankTagParseError) {
        setError(e.message);
      } else {
        setError("Unexpected error parsing bank tag");
      }
    }
  }

  return (
    <div className="osrs-panel p-4 rounded">
      <h3 className="font-semibold text-osrs-brown mb-2">Bank tag</h3>
      <p className="text-xs mb-2 text-osrs-brown-light">
        In RuneLite: right-click your boss bank-tag tab and choose &ldquo;Export tag tab&rdquo;. Paste here.
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        spellCheck={false}
        className="w-full p-2 text-xs font-mono bg-osrs-field text-osrs-brown border border-osrs-brown/40 rounded resize-y"
        placeholder="banktags,1,bossgear,21012,9242,27226,..."
      />
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={handleParse}
          disabled={value.trim().length === 0}
          className="px-3 py-1 bg-osrs-gold text-background rounded border border-osrs-gold disabled:opacity-50 hover:bg-osrs-gold-light"
        >
          Parse
        </button>
        {lastTagName && itemCount !== null && !error && (
          <span className="text-xs text-osrs-brown">
            Loaded &ldquo;{lastTagName}&rdquo; — {itemCount} items
          </span>
        )}
      </div>
      {error && <p className="text-xs text-status-missing mt-2">{error}</p>}
    </div>
  );
}
