# send to kindle

Send a file to your kindle in a single command.

## Installation

```sh
npm i -g s2k
```

Alternatively, you can run it with npx:

```sh
npx s2k ...
```

Or, you can run it with bunx:

```sh
bunx s2k ...
```

## Usage

```sh
s2k <file> [-t | --title] [-a | --author]

S2K_COOKIE='session-id=...' s2k <file> [-t | --title] [-a | --author]
```

> Note: You can set the environment variable S2K_COOKIE with a bash alias to avoid passing the cookie every time.

```bash
alias s2k="S2K_COOKIE='session-id=...' s2k $1"
```
