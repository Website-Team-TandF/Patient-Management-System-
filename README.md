# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## 📈 Lead Generation API

This section provides documentation for third-party developers or systems that will be responsible for creating leads in the Sagar Health Hospital Management System.

### Create a New Lead

Use this endpoint to submit a new lead from an external form.

- **Endpoint**: `/api/leads`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body

| Field | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Full name of the lead | Yes |
| `email` | `string` | Email address of the lead | Yes |
| `phoneNumber` | `string` | Contact phone number | Yes |
| `city` | `string` | City of residence | Yes |
| `healthIssue` | `string` | Brief description of the health concern | Yes |

#### Example Request

```json
{
  "name": "Amit Sharma",
  "email": "amit.sharma@example.com",
  "phoneNumber": "9876543210",
  "city": "Lucknow",
  "healthIssue": "Chronic Lower Back Pain"
}
```

#### Success Response

- **Status Code**: `201 Created`
- **Body**:

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1"
}
```

> [!IMPORTANT]
> The returned `_id` should be used to generate the personalized booking link for the lead:
> `https://<booking-app-url>/?leadId=64f1a2b3c4d5e6f7a8b9c0d1`

