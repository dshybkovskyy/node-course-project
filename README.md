# Exercise Tracker

This is the boilerplate for the Exercise Tracker project. Instructions for building your project can be found at https://www.freecodecamp.org/learn/apis-and-microservices/apis-and-microservices-projects/exercise-tracker

## Testing

The project uses Vitest for unit/integration tests and Supertest for HTTP endpoint tests.

### Commands

- `npm test` - run all tests once
- `npm run test:watch` - run tests in watch mode
- `npm run test:coverage` - run tests with coverage report

### Notes

- Tests run against an isolated in-memory SQLite database (`DB_FILENAME=:memory:`).
- Coverage thresholds are enforced in `vitest.config.ts`.

## Validation Rules

- `username` is required, trimmed, and must be at most 50 characters.
- `description` is required, trimmed, and must be at most 255 characters.
- `duration` must be a positive integer.
- `date` must be in `YYYY-MM-DD` format and be a real calendar date.
