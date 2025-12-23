import { $effect, have } from "libram";
import { Engine } from "../../engine/engine";
import { doFirstAvailableFishySource } from "./lib";


export class SeaEngine extends Engine {
  override prepare(): void {
    if (!have($effect`Fishy`) && !have($effect`Driving Waterproofly`)) {
      doFirstAvailableFishySource();
    }
  }
}
