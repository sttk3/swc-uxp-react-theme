# UXP plugin for React and Spectrum Web Components Theme

This starter is an example of a UXP plugin that uses React and Spectrum Web Components (SWC) to support the changing UI brightness in Photoshop.

It is adapted from [Photoshop React-based SWC starter plugin](https://github.com/AdobeDocs/uxp-photoshop-plugin-samples/tree/main/swc-uxp-react-starter)  (since UXP v7.3), with modifications to avoid errors and to make it easier to create a new plugin. The usage is almost the same as that.

## Getting started

**Pre-requisites**
1. [NodeJS](https://nodejs.org/en) (>= v 16.0.0)
2. [Yarn package manager](https://yarnpkg.com/getting-started/install)
3. UXP Developer Tool (UDT)
4. UXP >= 7.3

**Build and run**
1. Start by installing the dependencies `yarn install`.
2. Prepare the bundle using Webpack `yarn build`. You will notice a **dist** folder after this step.
3. (Optional) `yarn watch` to automatically build the project every time you update a source file and `yarn start` to keep the plugin running and automatically build after every change.

**Load the plugin into the application via UDT**
1. Make sure the application is running and you can see it under 'Connected apps'.
2. Click on 'Add Plugin' button and select the `manifest.json` of this plugin.
3. Configure the `dist` folder of your plugin by using 'More' -> 'Advanced' option from the action menu `•••`
4. Click on the ••• menu on the corresponding plugin row. Select 'Load' to view the plugin inside your application.
5. (Optional) Select 'Watch' from plugin actions ••• to dynamically load the latest plugin changes. Note that a manifest change would need you to 'Unload' and 'Load' the plugin from scratch.

You should be able to see a banner in Photoshop plugin.

## What Changed?

This repository has been modified by sttk3 from the original. The main changes are as follows.

### Avoid EvalError that occur in `yarn watch` or `npm run watch`

When generating a source-map, use settings without "eval" to prevent errors.

webpack.config.js
```
  devtool: "cheap-source-map",
```

### Avoid `Can't resolve 'photoshop'` errors

Modules such as uxp and photoshop must be made externally dependent.

webpack.config.js
```
  externals: {
    uxp: 'commonjs2 uxp',
    photoshop: 'commonjs2 photoshop',
    os: 'commonjs2 os',
    fs: 'commonjs2 fs',
  },
```

### Avoid phrases that have caused trouble in the past

* host is an object, not an array. Maybe in the future it should be an array, but for now it is not necessary
* minVersion is "24.4" instead of "24.4.0"

manifest.json
```
  "host": {
    "app": "PS",
    "minVersion": "24.4"
  },
```

### Add requiredPermissions

Change `"request"` to `"fullAccess"` if the plugin requires full access to the file. Since the property is already written, it is easy to edit.

manifest.json
```
  "requiredPermissions": {
    "localFileSystem": "request"
  },
```

### Add icons

Icons that do not change color for plugin, and icons that change color in two steps (dark and light) for panels are provided.

Folder
```
swc-uxp-react-theme
├── icons
│   ├── dark-panel@1x.png
│   ├── dark-panel@2x.png
│   ├── light-panel@1x.png
│   ├── light-panel@2x.png
│   ├── plugin@1x.png
│   └── plugin@2x.png
```

webpack.config.js
```
    {
      from: "icons",
      context: resolve("./"),
      to: resolve("dist/icons"),
    },
```

#### Icon definition for plugin

manifest.json
```
  "icons": [
    {
      "width": 48, "height": 48, "path": "icons/plugin.png", "scale": [ 1, 2 ],
      "theme": [ "darkest", "dark", "medium", "light", "lightest" ],
      "species": [ "pluginList" ]
    }
  ],
```

#### Icon definition for dark/light theme icons of the panel

manifest.json
```
      "icons": [
        {
          "width": 23, "height": 23, "path": "icons/dark-panel.png", "scale": [ 1, 2 ],
          "theme": [ "darkest", "dark", "medium" ], "species": [ "chrome" ]
        },
        {
          "width": 23, "height": 23, "path": "icons/light-panel.png", "scale": [ 1, 2 ],
          "theme": [ "light", "lightest" ], "species": [ "chrome" ]
        }
      ]
```

### Add a sample of command

Use `entrypoints.setup` to specify both panels and commands.

index.js
```
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
```

manifest.json
```
    {
      "type": "command",
      "id": "showCurrentTheme",
      "label": {
        "default": "Show Current Theme"
      }
    }
```

### Change color theme with change of UI blightness in Photoshop

Add functions to capture theme changes and to get the current theme name, respectively.

App.jsx
```
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
```

theme.js
```
/**
  * get current color theme of photoshop.  
  * reference: https://gist.github.com/tokyosheep/24403f1fe1d5fcda54f8267e14c619f6
  * @return {Promise<'darkest'|'dark'|'light'|'lightest'>} 
*/
export const getColorTheme = async () => {
  const result = await action.batchPlay(
    [
      {
        "_obj": "get", 
        "_target": [
          {"_property": "kuiBrightnessLevel"},
          {
            "_ref": "application", 
            "_enum": "ordinal", 
            "_value": "targetEnum", 
          }, 
        ], 
        "_options": {"dialogOptions": "dontDisplay"}, 
      }, 
    ], 
    
    {}
  ) ;
  const brightnessKey = result[0].kuiBrightnessLevel._value ;
  
  const brightnessTable = {
    'kPanelBrightnessDarkGray': 'darkest', 
    'kPanelBrightnessMediumGray': 'dark', 
    'kPanelBrightnessLightGray': 'light', 
    'kPanelBrightnessOriginal': 'lightest', 
  } ;
  
  const colorTheme = brightnessTable[brightnessKey] || 'dark' ;
  return colorTheme ;
} ;
```

### Specify text color with CSS variable `--spectrum-gray-800`

This color varies in density depending on Theme (sp-theme) of SWC. It is better to use instead of `--uxp-host-text-color`.

App.jsx
```
      <p
        style={ {
          color: 'var(--spectrum-gray-800)', 
          marginBottom: '8px', 
        } }
      >
        Text
      </p>
```
