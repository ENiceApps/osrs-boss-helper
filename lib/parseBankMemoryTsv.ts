// Parses the text the Bank Memory RuneLite plugin copies to the clipboard
// (right-click a saved bank → "Copy item data to clipboard"):
//
//   Item id<TAB>Item name<TAB>Item quantity
//   4151<TAB>Abyssal whip<TAB>1
//   995<TAB>Coins<TAB>12345678
//
// One header row, then id / name / quantity per item, with OS line endings.
// This is the paste path for players who use Bank Memory instead of our own
// Bank Sync plugin. The name column is ignored — ids are what the app runs on.

export class BankMemoryParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BankMemoryParseError";
  }
}

export interface BankMemoryBank {
  /** Owned items, coins excluded, duplicate ids summed. */
  items: Array<{ id: number; qty: number }>;
  /** Coins in the pasted bank — tracked as GP, same as the plugin does. */
  gp: number;
}

const COINS_ITEM_ID = 995;

export function parseBankMemoryTsv(input: string): BankMemoryBank {
  const lines = input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) {
    throw new BankMemoryParseError("Nothing pasted yet. Copy your bank from Bank Memory first!");
  }

  // The header is optional so a partial copy (rows only) still works.
  const rows = /^item id\t/i.test(lines[0]) ? lines.slice(1) : lines;

  const qtyById = new Map<number, number>();
  let gp = 0;
  let parsedRows = 0;
  for (const line of rows) {
    const cols = line.split("\t");
    if (cols.length < 3) continue;
    const id = Number(cols[0].trim());
    // Quantity is the LAST column so a name that somehow contains a tab still
    // reads right. Commas are tolerated in case it went through a spreadsheet.
    const qty = Number(cols[cols.length - 1].trim().replace(/,/g, ""));
    if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(qty)) continue;
    parsedRows++;
    // qty 0 = a bank placeholder: the player doesn't own it.
    if (qty <= 0) continue;
    const q = Math.round(qty);
    if (id === COINS_ITEM_ID) {
      gp += q;
      continue;
    }
    qtyById.set(id, (qtyById.get(id) ?? 0) + q);
  }

  if (parsedRows === 0) {
    throw new BankMemoryParseError(
      "That doesn't look like a Bank Memory export. In RuneLite, right-click your saved bank and pick \"Copy item data to clipboard\", then paste here.",
    );
  }

  const items = [...qtyById].map(([id, qty]) => ({ id, qty }));
  return { items, gp };
}
