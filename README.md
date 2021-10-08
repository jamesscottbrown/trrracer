# Trrracer

Trrracer is a tool for documenting the visualization design process as a Design Study Trace.

**It is currently a prototype under active development.**

It is implemented as a cross-platform desktop application written in [TypeScript](https://www.typescriptlang.org/) using the [Electron](https://www.electronjs.org/) framework and the [React](https://reactjs.org/) library.

Implementing as a desktop application has two main advantages:

- it means that there is no need to deploy a server to use the software
- it means a Trrrace can be edited offline (e.g., whilst travelling)
- it gives Trrrace access to system APIs to do things like take screenshots

## Downloading binaries

After each push or merge to the `master` branch, a GitHub Action runs to build binaries, an uploads these as assets for a draft release.

You can click on "Assets" on the [Releases page](https://github.com/jamesscottbrown/trrracer/releases), download the appropriate file for your platform (`.exe` for windows, `.dmg` for macOS, `.AppImage` for linux), and double-click to run (if using linux, you will need to make the downloadable file executable first).

(uploading of these assets sometimes fails due to [this issue](https://github.com/electron-userland/electron-builder/issues/4940) )

## Development

To install, clone the repo via git and install dependencies:

```bash
git clone https://github.com/jrogerthat/trrracer.git
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

## Instructions for Derya

There is a trrracer project folder named "Derya Artifact Trrracer" in the shared drive "trrrace". This is where all of the files from the design study that you want traced should live.

1. Clone the repo, `yarn install` the dependencies, and use `yarn start` to start the dev server. ** NEED NODE 14 **

2. If using a mac, navigate up to top left bar and click on `Electron`. There is a drop down menu there. (Opening a project from the main launch screen does not work yet).

3. Open Project >> [your google drive] >> shared drives >> trrrace >> Derya Artifact Trrracer

   - This project has the json file that is the backbone for the artifact organization. I added the files we had in there as sample entries. If they do not show up in the interface let me know!

4. When you select the project, a google auth window should appear in your browser window. Sign in with whatever google account that has our shared drive permissions. I added both emails to the dev oauth permissions, but the API access to the shared folder will not work if it's not that specific email.

5. There are 3 ways to add files to entries.

   - move a non-google drive file from a local folder with `Add file` button
   - create a google doc or google sheet with the `Create Google Doc` or `Create Google Sheet` button
   - move a google drive file in google drive to the folder and manually add the file name to the trrrace.json file. The file array for each entry looks like this `files: [ { title: "whatever-the-name-is.gdoc" } ]`. If the file is in the project folder, you just add another object with the file name as title parameter and when you refresh the electron app it will appear in the entry.
     (** I need to add functionality to move google drive files in the interface. If you try to add a google drive file within the interface it will throw an error **)

6. I will be adding functionality to the interface as we go. I'll let you know when I update the main branch!

** Flask **
`pip install`
`FLASK_ENV=development flask run`

You might need to use this:
`python3 -m spacy download en` 
