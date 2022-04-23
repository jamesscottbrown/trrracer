import React from 'react';
import { render } from 'react-dom';
import { ProjectStateProvider } from './components/ProjectContext';

import App from './AppWeb';

render(
  <React.StrictMode>
    <ProjectStateProvider>
      <App />
    </ProjectStateProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
