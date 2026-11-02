# Commits Process

### A commit must be:

- Frequent
- Atomic
- Descriptive
- Decentralized
- Immutable

### Commit message structure

- Type (Required)
- Incidence (Optional)
- Body (Optional)
- Footer (Optional)

### Type(Required)

- Identifies the reason for the commit. It can be categorized as:

* **FEAT** - New features
* **FIX** - To fix bugs or defects
* **CHORE** - For changes that do not affect the source but are necessary
* **CI** - Changes in the pipeline
* **DOCS** - For changing/creating documentation
* **PERF** - Performance improvements
* **REFACTOR** - For refactors (changing the code without changing features)
* **REVERT** - Revert changes
* **STYLE** - For cosmetic changes
* **TEST** - For testing

### Incidence (Optional)

- Allows you to designate the area that the commit will affect (file, application, functionality, department...)

### Body (Optional)

- Used to add more information to the commit description.

### Footer (whenever possible)

- Allows references to tickets in commits without obstructing the commit's subject line.

### Structure:

```
<type>[incidence]: <description>

<optional body>

<footer>
```

### Example: (the link below will appear as "#1" in the commit preview)

```
DOCS[PM/QA, processes]: Commits/Issues Processes and Meetings Template.

Creation of a commits and issues process to standardize Management Processes and the meetings template file in the [QA] Quality folder.

This commit is associated with the issue https://app.clickup.com/t/86bxe2x41
```