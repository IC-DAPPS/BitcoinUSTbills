# Bitcoin UST Bills - Playwright E2E Tests

This directory contains end-to-end tests for the Bitcoin UST Bills application using Playwright.

## Test Structure

```
tests/
├── helpers.ts                           # Test utilities and helpers
├── global-setup.ts                      # Global test setup
├── global-teardown.ts                   # Global test cleanup
├── auth/                                # Authentication tests
│   ├── create-ii-account.spec.ts       # Internet Identity account creation
│   └── derive-ii-principal.spec.ts     # Principal derivation
└── bitcoin-ust-bills/                   # Main application tests
    ├── main-app.spec.ts                # Main application functionality
    ├── payment-flow.spec.ts            # Payment flow tests
    └── balance-tests.spec.ts           # Balance and transaction tests
```

## Prerequisites

1. **DFX running locally**: `dfx start --clean`
2. **Internet Identity running**: Should be available at `http://localhost:4943`
3. **Node.js dependencies installed**: `npm install`
4. **Playwright browsers installed**: `npx playwright install`

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test Suites
```bash
# Run authentication tests only
npx playwright test --project=auth-tests

# Run main application tests only
npx playwright test --project=bitcoin-ust-bills-dfx

# Run with UI for debugging
npm run test:playwright:ui

# Run in debug mode
npm run test:playwright:debug
```

### Run Individual Test Files
```bash
# Run specific test file
npx playwright test tests/bitcoin-ust-bills/main-app.spec.ts

# Run with specific browser
npx playwright test --browser=chromium tests/auth/create-ii-account.spec.ts
```

## Test Data Management

Tests use a `test-output/` directory to persist data between test runs:

- `ii-anchor.txt` - Internet Identity anchor for authentication
- `derived-ii-principal-dfx.txt` - Derived principal for testing
- `installed-canister-id` - Canister ID for testing

## Test Configuration

The tests are configured in `playwright.config.ts` with:

- **Multiple projects** for different test scenarios
- **Global setup/teardown** for environment management
- **Retry logic** for flaky tests
- **Timeout configuration** for long-running operations
- **Reporter configuration** for test results

## CI/CD Integration

Tests are automatically run in GitHub Actions:

1. **Validation step** runs basic checks
2. **Playwright installation** installs browsers
3. **E2E tests** run the full test suite

## Debugging Tests

### Visual Debugging
```bash
# Run with UI
npm run test:playwright:ui

# Run in headed mode
npx playwright test --headed
```

### Debug Mode
```bash
# Run in debug mode with breakpoints
npm run test:playwright:debug
```

### Screenshots and Videos
- Screenshots are automatically taken on test failures
- Videos can be enabled in `playwright.config.ts`
- Test results are saved in `test-results/`

## Test Helpers

The `helpers.ts` file provides utilities for:

- **DFX environment management** - Loading environment variables
- **Authentication** - Internet Identity login flows
- **Data persistence** - Saving/reading test data
- **Balance management** - Transferring ICP for testing
- **UI interactions** - Waiting for elements, form filling
- **Error handling** - Robust error handling and debugging

## Writing New Tests

1. **Create test file** in appropriate directory
2. **Import helpers** from `../helpers`
3. **Use proper selectors** with data-testid attributes
4. **Handle authentication** using helper functions
5. **Add proper timeouts** for async operations
6. **Clean up test data** if needed

## Troubleshooting

### Common Issues

1. **DFX not running**: Start with `dfx start --clean`
2. **Internet Identity not available**: Ensure II is running on port 4943
3. **Test data missing**: Run authentication tests first
4. **Timeout errors**: Increase timeout in test configuration
5. **Element not found**: Check selectors and wait conditions

### Debug Commands

```bash
# Check DFX status
dfx ping

# Check Internet Identity
curl http://localhost:4943

# View test results
npx playwright show-report

# Run specific test with debug
npx playwright test --debug tests/bitcoin-ust-bills/main-app.spec.ts
```


