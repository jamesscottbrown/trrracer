# Trrracer

Trrracer is a tool for documenting the visualization design process as a Design Study Trace.

It is implemented as a cross-platform desktop application written in [TypeScript](https://www.typescriptlang.org/) using the [Electron](https://www.electronjs.org/) framework and the [React](https://reactjs.org/) library.

Implementing as a desktop application has two main advantages:

- it means that there is no need to deploy a server to use the software
- it means a Trrrace can be edited offline (e.g., whilst travelling)
- it gives Trrrace access to system APIs to do things like take screenshots

## Downloading binaries

After each push or merge to the `master` branch, a GitHub Action runs to build binaries, an uploads these as assets for a draft release.

You can click on "Assets" on the [Releases page](https://github.com/jamesscottbrown/trrracer/releases), download the appropriate file for your platform (`.exe` for windows, `.dmg` for macOS, `.AppImage` for linux), and double-click to run (if using linux, you will need to make the downloadable file executable first).

## Development

To install, clone the repo via git and install dependencies:

```bash
git clone https://github.com/jamesscottbrown/trrracer.git
cd trrracer
yarn
```

To start the app in the `dev` environment:

```bash
yarn start
```

To package apps for the local platform:

```bash
yarn package
```

## About

The initial scaffolding for this app was based on the [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) template, which uses <a href="https://electron.atom.io/">Electron</a>, <a href="https://facebook.github.io/react/">React</a>, <a href="https://github.com/reactjs/react-router">React Router</a>, <a href="https://webpack.js.org/">Webpack</a> and <a href="https://www.npmjs.com/package/react-refresh">React Fast Refresh</a>.
