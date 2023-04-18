#!/usr/bin/env node

import { env, cwd, argv } from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import { URL, fileURLToPath } from 'url'

// NOT Implemented yet in bun
// import { parseArgs } from 'node:util'

const CONTENT_TYPES = {
  epub: 'application/epub+zip',
  mobi: 'application/x-mobipocket-ebook',
  pdf: 'application/pdf',
  azw: 'application/vnd.amazon.ebook',
  azw3: 'application/vnd.amazon.ebook',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  rtf: 'application/rtf',
  html: 'text/html',
  htm: 'text/html',
  png: 'image/png',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  bmp: 'image/bmp',
}

const createUniqId = () => {
  let dt = new Date().getTime()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0
    dt = Math.floor(dt / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

const parseArgs = (input) => {
  const args = {}
  const regex = /-{1,2}(?<flag>[\w\n]+)[= ]{1}(?<value>[^\s]+)/gi
  input = input.slice(2)
  args.file = input[0]
  if (!args.file) return args
  input = input.join(' ')
  let matches
  while ((matches = regex.exec(input))) {
    const { flag, value } = matches.groups
    args[flag] = value
  }
  return args
}

const args = parseArgs(argv)
const pwd = cwd()
const dirname = fileURLToPath(new URL('.', import.meta.url))

const { version, author } = JSON.parse(
  fs.readFileSync(path.join(dirname, 'package.json'), 'utf8')
)

if (!args.file) {
  console.log(
    `[v${version}] Usage:

S2K_COOKIE='...' s2k <file> [-t|--title title] [-a|--author author]

// Supporded file types: ${Object.keys(CONTENT_TYPES).join('/')}`
  )
  process.exit()
}

const filepath = path.join(pwd, args.file)
let extname = path.extname(args.file)
const filename = path.basename(args.file)
const title = filename.replace(extname, '')
extname = extname.replace(/^\./, '').toLowerCase()

// const file = await Bun.file('./123.epub')
// const stream = await file.stream()
const { size } = fs.statSync(filepath)
const stream = fs.createReadStream(filepath)

const cookie = env.S2K_COOKIE || ''
const contentType = CONTENT_TYPES[extname]

// step 0: get csrfToken
// https://www.amazon.com/sendtokindle
// <input type='hidden' name='csrfToken' value='hNRatpOqodR1cTkH298m21jD6fRbkLPvb8vrAxxEmYggAAAAAGQ9gWwAAAAB' />

// TODO: The cookie frequently appears not to have expired, but the HTML obtained is expired, resulting in failure to obtain the csrfToken.
// retry here?
const csrfToken = await fetch('https://www.amazon.com/sendtokindle/empty', {
  headers: {
    cookie,
  },
})
  .catch((err) => {
    console.error('Get csrfToken error:', err)
  })
  .then((res) => res.text())
  .then((text) => /name='csrfToken' value='(.*)' \/>/gm.exec(text)[1])
  .catch((err) => {
    console.error('Get csrfToken error:', err)
  })

if (!csrfToken) {
  console.error('Cookie is expired, please get your cookie again`')
  process.exit()
}

// console.log('csrfToken:', csrfToken)

// step 1: get stkToken
const initParams = {
  fileSize: size,
  contentType,
  appVersion: '1.0',
  appName: 'drag_drop_web',
  fileExtension: extname,
}

const { uploadUrl, stkToken } = await fetch(
  'https://www.amazon.com/sendtokindle/init',
  {
    // verbose: true,
    headers: {
      'anti-csrftoken-a2z': csrfToken,
      'content-type': 'application/json',
      cookie,
    },
    body: JSON.stringify(initParams),
    method: 'POST',
  }
).then((res) => res.json())

// console.log('stkToken:', stkToken)

// step 2: upload file
await fetch(uploadUrl, {
  // verbose: true,
  headers: {
    'content-type': contentType,
    'content-length': size,
    cookie,
  },
  body: stream,
  method: 'PUT',
  duplex: 'half',
}).catch((err) => {
  console.error('Upload error:', err)
  process.exit()
})

// step 3: inform sendtokindle server
const sendParams = {
  extName: 'drag_drop_web',
  inputFormat: extname,
  extVersion: '1.0',
  stkToken: stkToken,
  title: args.title || args.t || title,
  dataType: contentType,
  stkGuid: '',
  author: args.author || args.a || author,
  archive: true,
  fileSize: size,
  inputFileName: filename,
  batchId: createUniqId(),
}

const { status } = await fetch('https://www.amazon.com/sendtokindle/send-v2', {
  headers: {
    'anti-csrftoken-a2z': csrfToken,
    'content-type': 'application/json',
    cookie,
  },
  body: JSON.stringify(sendParams),
  method: 'POST',
})
  .catch((err) => {
    console.error('Send error:', err)
    process.exit()
  })
  .then((res) => res.json())
  .catch((err) => {
    console.error('Send error:', err)
    process.exit()
  })

if (!status) {
  console.error('Send error')
  process.exit()
}

console.log(`✓ ${filename} has been sent.`)
