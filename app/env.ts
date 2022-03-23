import fs from "fs";
import path from "path";

export function validateProcessEnv () {
  const template = fs.readFileSync(path.join(__dirname, '../.env.template'), { encoding: "utf-8"})

  const definedEnvs = template.split('\n')
    .filter(line => !line.startsWith('#'))
    .map(line => line.split('='))
    .filter(tokens => tokens.length == 2)

  for (const definedEnv of definedEnvs.map(tokens => tokens[0])) {
    console.log(`${definedEnv} = ${eraseCredential(definedEnv, process.env[definedEnv])}`)
  }

  const requiredEnv = definedEnvs
    .filter(tokens => tokens[1] === '')
    .map(token => token[0])
    .filter(envName => !process.env[envName])

  if (requiredEnv.length > 0) {
    console.error('env required:', requiredEnv.join(', '))
    process.exit(1)
  }
}

const CREDENTIAL_REGEXP = /passwd|password|token|key|private|credential/i

function eraseCredential (name: string, value: string | undefined) {
  if (!value) {
    return value
  }
  if (CREDENTIAL_REGEXP.test(name)) {
    if (value.length > 8) {
      return `${value.slice(0, 4)}********${value.slice(value.length - 4)}`
    } else {
      return '********'
    }
  }
  return value
}
