import * as path from 'path'
import Mocha from 'mocha'
import glob from 'fast-glob'

export async function run() {
  // Create the mocha test
  const mocha = new Mocha({ ui: 'bdd' })

  const files = await glob('*.test.js', { cwd: __dirname })
  files.forEach((f) => mocha.addFile(path.resolve(__dirname, f)))

  // Run the mocha test
  try {
    mocha.run((failures) => {
      if (failures > 0) {
        throw new Error(`${failures} tests failed.`)
      }
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}
