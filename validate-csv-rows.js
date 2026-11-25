/**
 * Validate CSV row structures against expected headers.
 *
 * This utility checks that each row in a parsed CSV has the expected number
 * of columns based on the provided header array. It identifies rows with
 * missing or extra columns and returns structured validation results.
 *
 * @param {Array<string>} headers - Array of column header strings
 * @param {Array<Array<string>>} rows - Array of parsed CSV data rows
 * @returns {Object} Validation result containing validity status, expected column count,
 *         total rows checked, and any invalid rows with their indexes and issues
 *
 * @example
 * ```js
 * const headers = ['name', 'email', 'age'];
 * const rows = [
 *   ['John', 'john@example.com', '25'],
 *   ['Sarah', 'sarah@example.com'],
 *   ['David', 'david@example.com', '30', 'admin'],
 * ];
 *
 * const result = validateCsvRows(headers, rows);
 * // Returns structure identifying row 1 (missing column) and row 2 (extra column)
 * ```
 */
function validateCsvRows(headers, rows) {
  // Validate inputs
  if (!Array.isArray(headers)) {
    throw new Error('Headers must be an array');
  }

  if (!Array.isArray(rows)) {
    throw new Error('Rows must be an array');
  }

  const expectedColumnCount = headers.length;
  const invalidRows = [];

  // Validate each row
  rows.forEach((row, rowIndex) => {
    const actualColumnCount = row ? row.length : 0;

    if (actualColumnCount < expectedColumnCount) {
      invalidRows.push({
        rowIndex,
        issueType: 'missing_columns',
        expectedColumns: expectedColumnCount,
        actualColumns: actualColumnCount,
        missingColumns: expectedColumnCount - actualColumnCount,
      });
    } else if (actualColumnCount > expectedColumnCount) {
      invalidRows.push({
        rowIndex,
        issueType: 'extra_columns',
        expectedColumns: expectedColumnCount,
        actualColumns: actualColumnCount,
        extraColumns: actualColumnCount - expectedColumnCount,
      });
    }
  });

  return {
    isValid: invalidRows.length === 0,
    expectedColumnCount,
    totalRowsChecked: rows.length,
    invalidRows,
  };
}

module.exports = { validateCsvRows };