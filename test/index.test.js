// You can import your modules
// const index = require('../index')

test('that we can run tests', () => {
  // your real tests go here
  expect(1 + 2 + 3).toBe(6)
})

test('that empty lists do not get printed', () => {
  let similarFiles = []
  let ok2 = true
  if (similarFiles.length > 0) {
    ok2 = false
  }
  expect(ok2).toBe(true)
})

test('that non-empty lists do get printed', () => {
  let similarFiles = ['pom.xml', 'other.xml']
  let ok = false
  if (similarFiles.length > 0) {
    ok = true
  }
  expect(ok).toBe(true)
})

// For more information about testing with Jest see:
// https://facebook.github.io/jest/
