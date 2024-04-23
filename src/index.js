// react
import React from 'react' ;
import ReactDOM from 'react-dom/client' ;
window.React = React ;

// uxp
import { entrypoints } from 'uxp' ;

import App from './App.jsx' ;
let root ;

import { showCurrentTheme } from './theme.js' ;

const create = () => {
  if(!root) {
    root = ReactDOM.createRoot(document.getElementById('root')) ;
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    ) ;
  }
  return root ;
} ;

const show = (event) => {
  if(!root) {
    event.node.appendChild(create()) ;
  }
} ;

entrypoints.setup({
  commands: {
    showCurrentTheme: showCurrentTheme, 
  }, 
  panels: {
    themePanel: {
      create, 
      show, 
    }, 
  }, 
}) ;