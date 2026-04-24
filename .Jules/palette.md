## 2024-04-24 - Form Field Accessibility (`htmlFor` and `id`)
**Learning:** React form elements (such as `label` and `select`/`input`) frequently lack correct association (`htmlFor` linking to `id`). This reduces screen reader compatibility and generally limits UX for all users (e.g. clicking a label to focus an input).
**Action:** Always ensure that form inputs and their labels are explicitly linked via `htmlFor` on the `<label>` and a matching `id` on the `<input>` or `<select>` element. Add clear required indicators where appropriate.
