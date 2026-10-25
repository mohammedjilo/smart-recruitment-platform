# @smart-recruitment/eslint-config

Reusable ESLint flat configuration for sorting JSX attributes with
`eslint-plugin-perfectionist`.

## Use in this monorepo

Add the workspace package to a React project's development dependencies, then
include its config in the project's `eslint.config.js`:

```js
import eslint from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import { jsxProps } from "@smart-recruitment/eslint-config";

export default [
  eslint.configs.recommended,
  {
    files: ["**/*.{jsx,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
  },
  jsxProps,
];
```

The exported flat config applies only to `.jsx` and `.tsx` files. It does not
sort properties in JavaScript or TypeScript objects. Keep the consuming
project's existing parser and ESLint configs; the example shows the minimum
parser setup for TypeScript JSX.

## Sorting order

1. Identity and styling: `className`, `id`, `key`, `ref`, `style`
2. Common HTML attributes: `alt`, `href`, `name`, `placeholder`, `src`, `type`
3. Accessibility and testing attributes: `aria-*`, `data-*`
4. Value and state attributes: `checked`, `defaultValue`, `disabled`, `required`,
   `value`
5. Other attributes
6. Event handlers such as `onClick`, `onChange`, and `onSubmit`

Attributes are alphabetized within each group, case-insensitively. The plugin's
fixer changes JSX attribute order only; it leaves attribute values and object
property order unchanged.

Run ESLint with `--fix` to apply the ordering:

```sh
npx eslint . --fix
```

## Use in another React project

After publishing, install the config as a development dependency:

```sh
npm install --save-dev @smart-recruitment/eslint-config
```

ESLint must also be installed in the consuming project. Add the config to its
flat ESLint configuration:

```js
import { jsxProps } from "@smart-recruitment/eslint-config";

export default [
  // Other project-specific flat configs.
  jsxProps,
];
```

The config package declares `eslint-plugin-perfectionist` as a runtime
dependency, so consumers do not need to configure the plugin themselves.

## Prepare for npm publishing

This package is not published by this repository's build or lint scripts. When
ready to publish:

1. Choose and set the release version in this package's `package.json`.
2. Confirm the package name is available or that the publisher controls the
   `@smart-recruitment` npm scope.
3. Confirm the package's license and repository metadata match the project's
   release policy.
4. Run `npm pack --dry-run --workspace @smart-recruitment/eslint-config` and
   inspect the included files.
5. Authenticate with npm and publish explicitly with
   `npm publish --workspace @smart-recruitment/eslint-config --access public`.

Publishing is intentionally a separate, manual release step.
