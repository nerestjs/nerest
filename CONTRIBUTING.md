# Contributing

## Development

- Run tests with `npm run test`
- Write new tests for your changes. For new functionality, add it to the [harness](tests/integration/harness) and cover with integration tests
- Write commit messages and PR titles that follow [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) specification
- Write commits, comments and documentation in English

## Documentation

Keep documentation [in the docs repo](https://github.com/nerestjs/docs) up to date.

## Publishing

To publish a new version, [create a new release](https://github.com/nerestjs/nerest/releases/new) on GitHub. The release will automatically trigger a new version to be published to npm.

- Click "Generate release notes" to pull the list of all merged PRs into the changelog
- Put a release tag in the title, following semantic versioning, based on the merged PRs
- Click "Publish release"

## Issues

Use GitHub issues to report bugs and request features.
