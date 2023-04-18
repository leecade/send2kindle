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

### How to get the cookie

1. Visit [https://www.amazon.com/](https://www.amazon.com/) and sign in to your account.
2. Type `javascript:` in the address bar, then copy and paste the following code:

   ```js
   g = (n) => `${n}=${`; ${document.cookie}`.match(`;\\s*${n}=([^;]+)`)[1]};`
   prompt('Please copy the following:', g('session-id') + g('session-token'))
   ```

3. Press Enter and paste the code from the prompt, the code will look something like this:

   ```
   session-id=xxx-xxxx-xxxxx; session-token=xxxxxxxxxxxxxxxxxxxxx;
   ```

   > Note: Please don't worry, I will not keep or upload your cookies.
