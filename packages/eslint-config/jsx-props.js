import perfectionist from "eslint-plugin-perfectionist";

const jsxPropsConfig = {
  name: "@smart-recruitment/eslint-config/jsx-props",
  files: ["**/*.{jsx,tsx}"],
  plugins: {
    perfectionist,
  },
  rules: {
    "perfectionist/sort-jsx-props": [
      "warn",
      {
        type: "alphabetical",
        order: "asc",
        customGroups: [
          {
            groupName: "identity",
            elementNamePattern: "^(className|id|key|ref|style)$",
          },
          {
            groupName: "html",
            elementNamePattern: "^(type|name|href|src|alt|placeholder)$",
          },
          {
            groupName: "accessibility-and-test",
            elementNamePattern: "^(aria-.+|data-.+)$",
          },
          {
            groupName: "state",
            elementNamePattern:
              "^(value|checked|defaultValue|disabled|required)$",
          },
          {
            groupName: "events",
            elementNamePattern: "^on[A-Z].*$",
          },
        ],
        groups: [
          "identity",
          "html",
          "accessibility-and-test",
          "state",
          "unknown",
          "events",
        ],
      },
    ],
  },
};

export default jsxPropsConfig;
