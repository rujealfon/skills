# Agent Skills

A skills.sh-compatible catalog of reusable agent skills maintained in this
repository.

## Available skills

| Skill | Description |
| --- | --- |
| [Drizzle Postgres](skills/drizzle-postgres/README.md) | Build, migrate, query, and troubleshoot PostgreSQL data layers with Drizzle ORM and Drizzle Kit. |
| [Pinia Colada](skills/pinia-colada/README.md) | Build, review, migrate, test, and troubleshoot async data workflows with Pinia Colada in Vue and Nuxt applications. |
| [Zod](skills/zod/README.md) | Define, validate, and parse data with Zod (v4) — schemas, refinements/transforms, error handling, codecs, JSON Schema conversion, and Zod 3 → 4 migration. |

## Installation

Install a skill by its directory name:

```bash
npx skills add rujealfon/skills --skill <skill-name>
```

For example:

```bash
npx skills add rujealfon/skills --skill pinia-colada
```

## Adding a skill

Place each skill in its own `skills/<skill-name>/` directory with a
`SKILL.md`. Keep skill-specific usage, installation examples, and supporting
documentation inside that directory.

When adding another skill, add one row to the **Available skills** table above
and link to its README.

## License

Original repository content is available under the [MIT License](LICENSE).
