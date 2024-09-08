# <img src="./public/favicon.svg" alt="favicon" height="40" width="40" /> Capture Love

Wedding photos & videos upload app

<img src=".github/docs/feature_graphic.png" alt="feature_graphic" height="800">

---

## Deployment

### Setup GitHub pages
ATM there is some known problems when deploying to GitHub pages using tags
The current workaround for this can be found [here](https://github.com/actions/deploy-pages/issues/151#issuecomment-1491271099)

#### The quick guide

1. Go to project `Settings` > `Pages` > `Build and deployment`
    1. Set "**Source**" to "**GitHub Actions**"
1. Go to project `Settings` > `Environments`
    1. If not already there, create an environment called `github-pages`
    2. Set "**Deployment branches**" to "**All branches**"

### Deploy the app

Triggering the deploy job can be achieved in three ways:

#### 1. Via GitHub Project Page
Looking at the project main page on GitHub, on the right-hand side column, there is a section **"Releases"**.

Click on the button **"Create a new release"**.

Follow instructions, it is required to enter a tag such as **"v1.0.0"**

#### 2. Via Bash Script - Remotely
Using the script that lives in `scripts/deploy.sh`, you can call:

    yarn deploy --{TYPE}

Where `{TYPE}` can be `major`, `minor` or `patch`

#### 3. Via Console using GIT - Remotely
Go to the root of the project that was previously pulled from git.
In the console (always increment in the next release):

```sh
git tag v1.0.0
git push origin --tags
```

---

## Development
### Requirements
#### Node.js & yarn

Node version `>=20.9.0` and up needed to run the React scripts. And yarn to run the scripts and handle dependencies.

### Setup
Run the following commands to setup the project

```sh
cp .env.example .env
yarn install
```

### Commands

Install node dependencies:
```sh
yarn (install)
```

Run dev server for development in the browser:
```sh
yarn dev
```

To build application for production:
```sh
yarn build
```
