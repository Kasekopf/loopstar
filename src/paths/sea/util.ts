import { buyUsingStorage, cliExecute, Item, abort, storageAmount } from "kolmafia";

export function pull(item: Item) {
  if (storageAmount(item) === 0) {
    if (buyUsingStorage(item, 1, 15000) === 0) {
      abort(`Unable to buy desired pull item ${item.name}`);
    }
  }
  cliExecute(`pull ${item.name}`);
}
