import crypto from "crypto";

import type { Association } from "mdast";
import type { Node, Parent } from "unist";
import { u } from "unist-builder";
import { visit } from "unist-util-visit";

export default function remarkInlineFootnotes() {
  return (tree: Node) => {
    visit(tree, "footnoteDefinition", (def: Association & Parent) => {
      // Replace footnote references with inline footnotes
      visit(tree, "footnoteReference", (ref: Association, index, parent: Parent) => {
        // Only modify reference for this definition
        if (ref.identifier !== def.identifier)
          return;

        // Generate footnote identifier
        const ident = crypto.randomBytes(4).toString("hex");

        // Fetch footnote content
        const inner = (def.children?.[0] as Parent)?.children;

        // Insert footnote reference
        parent.children.splice(
          index,
          1,
          u("element", { data: { hName: "span", hProperties: {
              className: "footnote",
          }}}, [
              u("element", { data: { hName: "label", hProperties: {
                for: `footnote-${ident}`,
              }}}),
              u("element", { data: { hName: "input", hProperties: {
                id: `footnote-${ident}`,
                type: "checkbox",
              }}}),
              u("element", { data: { hName: "span" }}, [
                u("element", { data: { hName: "span" }}, inner),
              ]),
            ],
          ),
        );
      });
    });
  };
}
