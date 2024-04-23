// photoshop
import { app, action, core } from 'photoshop' ;

/**
  * get current color theme of photoshop.  
  * reference: https://gist.github.com/tokyosheep/24403f1fe1d5fcda54f8267e14c619f6
  * @return {Promise<'darkest'|'dark'|'light'|'lightest'>} 
*/
export const getColorTheme = async () => {
  const result = await action.batchPlay(
    [
      {
        '_obj': 'get', 
        '_target': [
          {'_property': 'kuiBrightnessLevel'},
          {
            '_ref': 'application', 
            '_enum': 'ordinal', 
            '_value': 'targetEnum', 
          }, 
        ], 
        '_options': {'dialogOptions': 'dontDisplay'}, 
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

export const showCurrentTheme = async () => {
  try {
    await core.executeAsModal(async (executionContext, descriptor) => 
      {
        await app.showAlert(await getColorTheme()) ;
      }, 

      {
        'commandName': 'showCurrentTheme', 
        'interactive': true, 
      }, 
    ) ;
  } catch(e) {
    console.log(e) ;
  }
} ;
