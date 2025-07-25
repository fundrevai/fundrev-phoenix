# Arize Phoenix App

The Phoenix application is a web application built to enable rapid troubleshooting and EDA of model inferences and LLM applications. It is hosted by the Phoenix server and consumes the GraphQL API served by the Python runtime.

## Installation

To build and develop the web application, you must first install the dependencies via `pnpm` (performant node package manager). Once [installed](https://pnpm.io/installation), install the dependencies using the following command:

```shell
pnpm install --frozen-lockfile
```

NB: The `--frozen-lockfile` flag forces `pnpm` to install the exact versions specified in `pnpm-lock.yaml` and will not re-build the lockfile.

## Develop

To develop the UI, you must run the `app` in conjunction with the backend server. You can start the application in development mode via the following:

**Important:** Before running the development server for the first time, you need to build the app:

```shell
pnpm run build
```

```shell
pnpm run dev
```

Before running the script above you should configure your running environment by creating a `.env` file besides the `.env.example` file in the root of this project. You can find an example of the `.env` file in the `.env.example` file.

Depending on what flows you are trying to build features for, you may want to adjust the scripts block within the [package.json](./package.json) file so that the server is serving the appropriate fixture data.

### Authentication

For local development, you have two options for authentication:

1. **Bypass Authentication:**
   - Edit your `.env` file and set:
     ```
     PHOENIX_ENABLE_AUTH=False
     ```
   - This will disable authentication and allow you to access the app without logging in.

2. **Default Credentials:**
   - If authentication is enabled, you can log in with the default credentials:
     - **Email:** `admin@localhost`
     - **Password:** `admin`


## Build

The app is written in `typescript` and leverages [esbuild](https://esbuild.github.io/) as well as the [relay-compiler](https://relay.dev/docs/guides/compiler/) to compile highly efficient `graphql` queries. Because of this, the build script involves:

1. Building the `javascript` and `css` assets using `esbuild`
2. Building the compiled graphql queries using the `relay-compiler`
3. Building the static assets, e.g. scaffolding the server static serving directory

The web build ensures that the UI as well as the data-fetching layer is fully type safe with regards to the GraphQL schema. The type safety of the application is statically validated via the typescript CI pipeline.

## Test

The Phoenix app is statically analyzed for type safety via `typescript`, statically analyzed for best practices via [eslint](https://eslint.org/), and the formatting is enforced via the `prettier` code formatter. For unit testing, the app leverages [vitest](https://vitest.dev/) as a unit testing framework. Lastly, for integration tests (e.g. end-to-end or e2e), [playwright](playwright.dev) is used. The following `pnpm` commands correspond to the above safeguards.

```shell
pnpm run typecheck
pnpm run lint
pnpm run prettier:check
pnpm test
pnpm run test:e2e
```

NB: [prettier](https://prettier.io/) is also enforced via [pre-commit](https://pre-commit.com/) hooks.

### Integration Tests

The integration tests run against the phoenix server built in "production" mode. Meaning you will have to have phoenix installed in your local python environment.

```shell
# from the root of the repository
pip install -e .

# from the app directory
pnpm run build
pnpm run test:e2e
```

## Architecture

The Phoenix app is a [react](https://react.dev) application built on top of a [graphql](https://graphql.org) API. The data-fetching for the API is managed via [react-relay](https://relay.dev/), an opinionated data fetching and storage library. The API contract between the server and the app is managed via a `schema.graphql` file stored at the root of this directory. The schema is generated via server build scripts. Similarly the queries against the schema are compiled via the `relay-compiler`. `relay` allows the application to colocate the data requirements of components with the components itself, enabling maximal efficiency and clarity as to how data flows through the system.

Within the [react](https://react.dev) app, there is additional `state` and `context` that is managed via `react`'s built-in hooks. In addition to `react`'s built-in state management, [zustand](https://github.com/pmndrs/zustand) is also leveraged as central store to manage the large amount of state for the point-cloud visualization. `zustand` provides a highly scalable way to manage a large amount of state across components without paying a performance penalty when sub-parts of the state changes due to user interaction.

The phoenix app is a client-side only SPA (single-page application), meaning that it entirely manages the routing of the pages via [react-router](https://reactrouter.com/en/main). `react-router` is leveraged to provide nested routing (e.g. rendering different parts of the UI based on the path) and is also utilized to load data as routes change (see [loaders](https://reactrouter.com/en/main/route/loader)).

All UI components used in Phoenix are being migrated from `@arizeai/components` to be self-contained within Phoenix using `react-aria-components`. Arize also maintains `@arizeai/point-cloud` a 3D visualization library built on top of [threejs](https://threejs.org/) and [react-three-fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction).
