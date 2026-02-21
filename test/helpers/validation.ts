import { equal } from 'node:assert';

export function validateJsonField(
  fieldName: string,
  jsonStr: string | null | undefined,
  expectArray = true,
) {
  if (jsonStr == null) return;

  try {
    const parsed = JSON.parse(jsonStr);

    if (expectArray) {
      equal(Array.isArray(parsed), true, `${fieldName} should be an array`);
    } else {
      equal(typeof parsed, 'object', `${fieldName} should be an object`);
    }
  } catch (e) {
    console.error(`Invalid JSON in ${fieldName}:`, e);
    throw new Error(`Invalid JSON in ${fieldName}`);
  }
}
