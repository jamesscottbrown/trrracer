import React, { useState } from 'react';
import { Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
import { FaCamera } from 'react-icons/fa';

const Screenshot = ({ folderPath, entryIndex }) => {
  const [fileName, setFileName] = useState<string>(new Date().toISOString());

  // Can find the [display](https://www.electronjs.org/docs/v14-x-y/api/structures/display) object a window is on.
  // Should be able to match with the [DesktopCapturerSource](https://www.electronjs.org/docs/latest/api/structures/desktop-capturer-source) using the `display_id` attribute, but it is [empty on linux](https://github.com/electron/electron/issues/27732)
  // so we can let the user select which region to screenshot, but don't know which screen they mean.
  // could ake a screenshot for each, and let them choose?

  const onSnipClick = async () => {
    const { desktopCapturer, remote } = window.require('electron');
    const path = window.require('path');
    const fs = window.require('fs');

    const currentWindow = remote.getCurrentWindow();
    const windowBounds = currentWindow.getBounds();

    // win.hide();

    try {
      const currentScreen = remote.screen.getDisplayNearestPoint({
        x: windowBounds.x,
        y: windowBounds.y,
      });

      // TODO: should use current_screen, not the primary display
      const screenSize = remote.screen.getPrimaryDisplay().workAreaSize;
      const maxDimension = Math.max(screenSize.width, screenSize.height);

      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: maxDimension * window.devicePixelRatio,
          height: maxDimension * window.devicePixelRatio,
        },
      });

      const source = sources.find(
        (s) => s.name === 'Entire Screen' || s.name === 'Screen 1'
      );

      if (source) {
        const image = source.thumbnail
          .resize({
            width: screenSize.width,
            height: screenSize.height,
          })
          .crop(windowBounds)
          .toPNG();

        const outputPath = path.join(folderPath, `${fileName}.png`);
        fs.writeFile(
          outputPath,
          image,
          (err: Error) => err && console.error(err)
        );
      } else {
        window.alert('Source not found.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <FormControl>
        <FormLabel>Filename: </FormLabel>
        <Input
          value={fileName}
          onChange={(ev) => setFileName(ev.target.value)}
        />
      </FormControl>
      <Button onClick={onSnipClick}>
        <FaCamera /> Save screenshot
      </Button>
      {folderPath}, {entryIndex}
    </>
  );
};

export default Screenshot;
