/**
 * Test suite for validateCsvRows utility
 */

const { validateCsvRows } = require('./validate-csv-rows');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`✅ ${name}`);
  } catch (error) {
    failed++;
    console.error(`❌ ${name}: ${error.message}`);
  }
}

function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`${message || 'Assertion failed'}. Expected: ${expectedStr}, Got: ${actualStr}`);
  }
}

function assertTrue(value, message) {
  if (!value) throw new Error(message || 'Expected true');
}

function assertFalse(value, message) {
  if (value) throw new Error(message || 'Expected false');
}

// Test 1: Valid dataset - all rows have correct column count
test('Valid dataset returns isValid: true', () => {
  const headers = ['name', 'email', 'age'];
  const rows = [
    ['John', 'john@example.com', '25'],
    ['Sarah', 'sarah@example.com', '30'],
  ];
  const result = validateCsvRows(headers, rows);
  assertEqual(result.isValid, true, 'Expected isValid to be true');
  assertEqual(result.expectedColumnCount, 3);
  assertEqual(result.totalRowsChecked, 2);
});

// Test 2: Row with missing columns
test('Row with missing columns detected', () => {
  const headers = ['name', 'email', 'age'];
  const rows = [
    ['John', 'john@example.com', '25'],
    ['Sarah', 'sarah@example.com'], // missing 'age'
  ];
  const result = validateCsvRows(headers, rows);
  assertEqual(result.isValid, false, 'Expected isValid to be false');
  assertEqual(result.invalidRows.length, 1);
  assertEqual(result.invalidRows[0].rowIndex, 1);
  assertEqual(result.invalidRows[0].issueType, 'missing_columns');
  assertEqual(result.invalidRows[0].missingColumns, 1);
});

// Test 3: Row with extra columns
test('Row with extra columns detected', () => {
  const headers = ['name', 'email', 'age'];
  const rows = [
    ['John', 'john@example.com', '25'],
    ['Sarah', 'sarah@example.com', '30', 'admin'], // extra 'admin'
  ];
  const result = validateCsvRows(headers, rows);
  assertEqual(result.isValid, false, 'Expected isValid to be false');
  assertEqual(result.invalidRows.length, 1);
  assertEqual(result.invalidRows[0].rowIndex, 1);
  assertEqual(result.invalidRows[0].issueType, 'extra_columns');
  assertEqual(result.invalidRows[0].extraColumns, 1);
});

// Test 4: Multiple invalid rows
test('Multiple invalid rows detected', () => {
  const headers = ['name', 'email', 'age'];
  const rows = [
    ['John', 'john@example.com', '25'],
    ['Sarah', 'sarah@example.com'], // missing age
    ['David', 'david@example.com', '30'], // valid
    ['Emily', 'emily@example.com', '28', 'extra'], // extra field
  ];
  const result = validateCsvRows(headers, rows);
  assertEqual(result.isValid, false);
  assertEqual(result.invalidRows.length, 2);
  // Row 1 (index 1) should be missing_columns
  assertEqual(result.invalidRows[0].rowIndex, 1);
  assertEqual(result.invalidRows[0].issueType, 'missing_columns');
  // Row 3 (index 3) should be extra_columns
  assertEqual(result.invalidRows[1].rowIndex, 3);
  assertEqual(result.invalidRows[1].issueType, 'extra_columns');
});

// Test 5: Empty headers
test('Empty headers array', () => {
  const headers = [];
  const rows = [['John']];
  const result = validateCsvRows(headers, rows);
  assertEqual(result.expectedColumnCount, 0);
  assertEqual(result.invalidRows.length, 1);
  assertEqual(result.invalidRows[0].issueType, 'extra_columns');
  assertEqual(result.invalidRows[0].extraColumns, 1);
});

// Test 6: Empty rows array
test('Empty rows array', () => {
  const headers = ['name', 'email'];
  const rows = [];
  const result = validateCsvRows(headers, rows);
  assertEqual(result.isValid, true);
  assertEqual(result.totalRowsChecked, 0);
  assertEqual(result.invalidRows.length, 0);
});

// Test 7: Original inputs not modified
test('Original inputs not modified', () => {
  const headers = ['name', 'email', 'age'];
  const rows = [
    ['John', 'john@example.com', '25'],
  ];
  const originalHeaders = [...headers];
  const originalRows = [...rows];
  validateCsvRows(headers, rows);
  assertEqual(headers.join(','), originalHeaders.join(','), 'Headers should not be modified');
  assertEqual(rows[0].join(','), originalRows[0].join(','), 'Rows should not be modified');
});

// Test 8: Row with zero columns
test('Row with zero columns', () => {
  const headers = ['name', 'email'];
  const rows = [[]];
  const result = validateCsvRows(headers, rows);
  assertEqual(result.isValid, false);
  assertEqual(result.invalidRows.length, 1);
  assertEqual(result.invalidRows[0].issueType, 'missing_columns');
  assertEqual(result.invalidRows[0].missingColumns, 2);
});

// Test 9: Mixed valid and invalid rows
test('Mixed valid and invalid rows', () => {
  const headers = ['a', 'b', 'c'];
  const rows = [
    ['1', '2', '3'], // valid
    ['4', '5'], // missing c
    ['6', '7', '8', '9'], // extra column
  ];
  const result = validateCsvRows(headers, rows);
  assertEqual(result.isValid, false);
  assertEqual(result.invalidRows.length, 2);
  assertEqual(result.invalidRows[0].rowIndex, 1);
  assertEqual(result.invalidRows[1].rowIndex, 2);
});

// Test 10: Invalid header input
test('Throws error for non-array headers', () => {
  let threw = false;
  try {
    validateCsvRows('not an array', [['a']]);
  } catch (e) {
    threw = true;
  }
  assertTrue(threw, 'Expected error for non-array headers');
});

// Test 11: Invalid row input
test('Throws error for non-array rows', () => {
  let threw = false;
  try {
    validateCsvRows(['a'], 'not an array');
  } catch (e) {
    threw = true;
  }
  assertTrue(threw, 'Expected error for non-array rows');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);