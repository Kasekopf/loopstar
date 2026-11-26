import { Args } from "grimoire-kolmafia";
import { write } from "kolmafia";
import { generateHTML, handleApiRequest, RelayDropdown, RelayPage, RelaySetting } from "msr";
import { args, supportedWorksheds } from "./args";
import { $item } from "libram";

function convertArgsToHtml(): RelayPage[] {
  const metadata = Args.getMetadata(args);
  const pages: RelayPage[] = [
    {
      page: metadata.options.defaultGroupName ?? "Options",
      file: metadata.options.defaultGroupName ?? "Options",
      components: [],
    },
  ];

  metadata.traverse(
    (key, name: string) => {
      if (key.setting === "" || key.hidden) return;

      const base = {
        name: key.key ?? name,
        description: key.help || "No Description Provided",
        preference: key.setting ?? `${metadata.scriptName}_${key.key ?? name}`,
        default: "default" in key ? `${key["default"]}` : undefined,
      };

      let component: RelaySetting | RelayDropdown;
      if (key.valueHelpName === "FLAG" || key.valueHelpName === "BOOLEAN") {
        component = { ...base, type: "boolean" };
      } else if (name === "workshed" || name === "swapworkshed") {
        // Hardcoded hack; show workshed options
        component = {
          ...base,
          type: "dropdown",
          dropdown: supportedWorksheds.map((i) => {
            const name = i === $item`none` ? "none" : i.name;
            return { display: name, value: name };
          }),
        };
      } else if (key.options !== undefined) {
        component = {
          ...base,
          type: "dropdown",
          dropdown: key.options.map(([k, desc]) => {
            return { display: desc ?? k, value: k };
          }),
        };
      } else {
        component = { ...base, type: "string" };
      }
      pages[pages.length - 1].components.push(component);
    },
    (group, name: string) => {
      pages.push({ page: group.name, file: name, components: [] });
    }
  );

  return pages.filter((page) => page.components.length > 0);
}

export function main() {
  if (handleApiRequest()) return;
  write(generateHTML(convertArgsToHtml()));
}
