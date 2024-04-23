// react
import React, { useEffect, useState } from 'react' ;

// swc
import { Button } from '@swc-react/button' ;
import { Theme } from '@swc-react/theme' ;

import { getColorTheme, showCurrentTheme } from './theme.js' ;

const App = () => {
  const [colorTheme, setColorTheme] = useState('dark') ; 

  const handleThemeChanged = (theme) => {
    setColorTheme(theme) ;
  } ;

  useEffect(() => {
    // apply current color theme on componentDidMount
    (async () => {
      setColorTheme(await getColorTheme()) ;
    })() ;
    
    // add an listener for theme on componentDidMount
    document.theme.onUpdated.addListener(handleThemeChanged) ;

    return () => {
      // remove an listener for theme on componentDidUnmount
      document.theme.onUpdated.removeListener(handleThemeChanged) ;
    } ;
  }, []) ;

  return (
    <Theme
      theme='spectrum'
      scale='medium'
      color={colorTheme}
      style={ {
        display: 'flex', 
        flexDirection: 'column', 
        padding: '12px', 
      } }
    >
      <p
        style={ {
          color: 'var(--spectrum-gray-800)', 
          marginBottom: '8px', 
        } }
      >
        Text
      </p>

      <Button
        treatment='outline'
        variant='primary'
        onClick={showCurrentTheme}
      >
        Show current theme
      </Button>
    </Theme>
  ) ;
} ;

export default App ;
