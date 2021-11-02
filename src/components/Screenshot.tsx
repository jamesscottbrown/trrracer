import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  FormControl,
  FormLabel,
  Image,
  Input,
} from '@chakra-ui/react';
import { FaCamera } from 'react-icons/fa';

const Screenshot = ({ folderPath, entryIndex }) => {
  const [fileName, setFileName] = useState<string>(new Date().toISOString());

  const [numScreenshots, setNumScreenshots] = useState<number>(0);
  const [baseName, setBaseName] = useState<string>('');

  // Can find the [display](https://www.electronjs.org/docs/v14-x-y/api/structures/display) object a window is on.
  // Should be able to match with the [DesktopCapturerSource](https://www.electronjs.org/docs/latest/api/structures/desktop-capturer-source) using the `display_id` attribute, but it is [empty on linux](https://github.com/electron/electron/issues/27732)
  // so we can let the user select which region to screenshot, but don't know which screen they mean.
  // could ake a screenshot for each, and let them choose?

  const onSnipClick = async () => {
    const { desktopCapturer, remote } = window.require('electron');
    const path = window.require('path');
    const os = window.require('os');
    const fs = window.require('fs');

    const currentWindow = remote.getCurrentWindow();
    const windowBounds = currentWindow.getBounds();

    currentWindow.hide();

    try {
      const currentScreen = remote.screen.getDisplayNearestPoint({
        x: windowBounds.x,
        y: windowBounds.y,
      });

      // TODO: should use current_screen, not the primary display
      const screenSize = remote.screen.getPrimaryDisplay().workAreaSize;
      const maxDimension = Math.max(screenSize.width, screenSize.height);

      // probably need to scale each screenshot differently?
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: maxDimension * window.devicePixelRatio,
          height: maxDimension * window.devicePixelRatio,
        },
      });

      const dateTime = new Date().toISOString();
      let i = 0;
      for (const source of sources) {
        const image = source.thumbnail
          .resize({
            width: screenSize.width,
            height: screenSize.height,
          })
          .crop(windowBounds)
          .toPNG();

        const outputPath = path.join(os.tmpdir(), `${dateTime}_${i}.png`);
        fs.writeFile(
          outputPath,
          image,
          (err: Error) => err && console.error(err)
        );
        i += 1;
      }

      setNumScreenshots(sources.length);
      setBaseName(path.join(os.tmpdir(), `${dateTime}`));

      //         const outputPath = path.join(folderPath, `${fileName}.png`);
      currentWindow.show();
    } catch (err) {
      currentWindow.show();
      console.error(err);
    }
  };

  if (numScreenshots === 0) {
    return (
      <>
        <p>
          Position window over the region which you would like to screenshot.
        </p>
        <Button onClick={onSnipClick}>
          <FaCamera /> Take screenshot
        </Button>
        {folderPath}, {entryIndex}
      </>
    );
  }

  return (
    <>
      <FormControl>
        <FormLabel>Filename: </FormLabel>
        <Input
          value={fileName}
          onChange={(ev) => setFileName(ev.target.value)}
        />
      </FormControl>
      <Grid>
        {Array.from(Array(numScreenshots).keys()).map((i) => (
          <Box key={{ i }}>
            <Image src={`file://${baseName}_${i}.png`} />
          </Box>
        ))}
      </Grid>
      <Button onClick={onSnipClick}>
        <FaCamera /> Discard these, and take new screenshot
      </Button>
      {folderPath}, {entryIndex}
    </>
  );
};

export default Screenshot;
