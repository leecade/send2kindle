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
alias s2k='S2K_COOKIE="session-id=..." s2k $1'
```

### How to get the cookie

1. Visit [https://www.amazon.com/](https://www.amazon.com/) and sign in to your account.
2. Open the Chrome DevTools, go to Application > Storage > Cookies, and find the following cookie names:

   - `session-id`
   - `session-token`
   - `aws-ubid-main`
   - `x-main`
   - `at-main`
   - `ubid-main`

   Copy the values of these cookies and paste them into the S2K_COOKIE environment variable, like this:

   ```
   session-id=xxx; session-token=xxx; aws-ubid-main=xxx; x-main=xxx; at-main=xxx; ubid-main=xxx;
   ```

> Note: Please don't worry, I will not keep or upload your cookies.
