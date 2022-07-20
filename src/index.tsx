import React from 'react';
import { render } from 'react-dom';
import { ProjectStateProvider } from './components/ProjectContext';

import App from './App';

console.log('is this firing mulitple times in app');
render(
  <React.StrictMode>
    <ProjectStateProvider>
      <App />
    </ProjectStateProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
