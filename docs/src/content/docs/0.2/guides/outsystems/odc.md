---
title: OutSystems Developer Cloud (ODC)
description: How to get started with Islands in OutSystems Developer Cloud
slug: 0.2/guides/outsystems/odc
---

## Forge component

In ODC Studio, install the OutSystems Astro Islands Forge component.

## Building a separate library

This is the recommended approach. It allows isolation of your library in a separate module/application. It allows better reusability across other apps in your OutSystems instance.

- Click the **Create** button and choose **Library** from the dropdown.
  ![Create a library in ODC](../../../../../assets/odc/0.2/create-library.png)

- On the **Enter your library details** screen, add the name, description (optional) and icon(optional). Click the **Create Library** button.
  ![Fill in application basic info](../../../../../assets/odc/0.2/create-library-basic-info.png)

## Adding Islands dependency

- Right click on the UI Flows folder and select Add public element...
  ![Add public elements](../../../../../assets/odc/0.2/add-public-element.png)

- On the **Add public elements to \[library]** popup, select the **All sources** dropdown and search for Islands. On the second dropdown, where UI Flow may be selected, select **All sources**. From the elements list, select the `Astro` flow, `AstroIsland` block and `CreateFunctionProp` client action. Click the **Add** button.
  ![Add Islands elements](../../../../../assets/odc/0.2/add-elements.png)

## Editing module

- Right click on UI Flow and click Add UI Flow. Give the flow a name such as Library. This can also be updated later in the information panel.
  ![Add module UI Flow](../../../../../assets/odc/0.2/module-add-ui-flow.png)
  ![Set module UI Flow name](../../../../../assets/odc/0.2/module-add-ui-flow-name.png)

- Right click on the newly created flow and click Add Block. Give it a name.
  ![Add new block](../../../../../assets/odc/0.2/module-add-block.png)
  ![Set block name](../../../../../assets/odc/0.2/module-add-block-name.png)

- Give the block a description and icon. It is recommended to add description and change the default icon. If both of these are done, when consumed, your library/widget can be made available as a selectable element in the component panel.
  - Click on the block name. Select the three dots in the information panel to edit the description. Click the close button in the description popup.
    ![Editing the block description](../../../../../assets/odc/0.2/block-add-description.png)
  - In the information panel, click on the dropdown that says **Default Icon** and select **Change Icon**. Find and upload the icon you would like to use.
    ![Editing the default module icon](../../../../../assets/odc/0.2/block-icon.png)

- Change the Public attribute to Yes if this block will be consumed by other modules.
  ![Changing the public attribute of the block](../../../../../assets/odc/0.2/block-public.png)

## Parameters

Astro Islands can take input parameters and functions, but they must first serialized in a particular way. Text and objects must be serialized using the tools provided by the OutSystems Astro Islands module. Functions/handlers must be bound to the `document` (or `window`) object as that is the only method to invoke them. See the [Using OutSystems handlers](#using-outsystems-handlers) section to view implementation in the Astro component.

- Right click on the block and click on add input parameter. Give the parameter a name and type. The parameter can be text, number or structure. Do this for every input parameters.
  ![Add input parameter](../../../../../assets/odc/0.2/block-add-input-parameter.png)
  ![Modify input parameter name and type](../../../../../assets/odc/0.2/block-input-parameter-name-type.png)

- Go to the Data tab in ODC Studio.
  ![Select Data tab](../../../../../assets/odc/0.2/block-prop-data-tab.png)

- Right click on structures and select `Add a structure`.
  ![Add structure](../../../../../assets/odc/0.2/props-add-structure.png)

- Give the structure the name of library and Props (for example, CounterProps). This is to distinguish it from any other blocks in this library that may have props.
  ![Set structure name](../../../../../assets/odc/0.2/props-structure-name.png)

- Add every input parameter as an attribute into the Prop structure. Make sure to set their types. Any function handlers should be added by their name as a text attribute type.
  ![Add structure attributes](../../../../../assets/odc/0.2/props-add-structure-attributes.png)

- Go back to the Interface tab and click on the block.
  ![Select Interface tab](../../../../../assets/odc/0.2/select-interface-tab.png)

- Right click on the block and select **Add Local Variable**.
  ![Add local variable](../../../../../assets/odc/0.2/params-add-local-variable.png)

- Give the new local variable the name **Props** and then select the structure you created in the previous steps as the type. This is the incoming parameters that will be passed into the front-end library.
  ![Set local variable name and type](../../../../../assets/odc/0.2/params-set-name-type.png)

- Create another local variable and call it **PropsSerialized**. The type for this variable should be **Text**. This is the serialized value that is necessary for the `astro-island` component to process the values.
  ![SerializedProps local variable](../../../../../assets/odc/0.2/props-serialized.png)

### Initialize and apply parameters

#### Prepare parameters

- If there are any functions handlers coming in, create a function and a function handler. The function should call the handler (with any parameters that it needs).
  - To add a client action, right click on the block and select the `Add Client Action`. Give the action a name. Make sure to add any input and output parameters your action needs.
    ![Add Client Action](../../../../../assets/odc/0.2/add-client-action.png)
  - To add an event handler, right click on the block and select `Add Event`. Give the event handler a name. Make sure to match any of the input and output parameters.
    ![Add Event](../../../../../assets/odc/0.2/add-event-handler.png)
  - You can then assign the event handler inside of the client actions.
    ![Add event handler to client action](../../../../../assets/odc/0.2/add-event-handler-client-action.png)

- Right click on the Counter block and select Add Client Action. Name it PrepareProps.
  ![Add Client Action PrepareProps](../../../../../assets/odc/0.2/add-prepare-props.png)

- If you have any functions, you will need to add a special JavaScript block. Drag over the JavaScript component and name it `SetFunctionProps`. Open the JavaScript contents.
  ![Add JavaScript SetFunctionProps](../../../../../assets/odc/0.2/add-javascript-set-function-props.png)
  ![Add JavaScript content for SetFunctionProps](../../../../../assets/odc/0.2/add-javascript-set-function-props-content.png)

- Inside of the JavaScript block, you will need to bind any function handlers to the document body. There is also and Astro Island function to randomize the name so that there are no function collisions. You can use the following script to bind them (update names to match your components):

  ```js
  const ShowMessageName =
    $actions.CreateFunctionProp("ShowMessage").UpdatedFunctionName;
  document[ShowMessageName] = $actions.ShowMessage;
  $parameters.ShowMessageName = ShowMessageName;
  ```

  Ensure that the library inside of your Astro components is calling the `document[FUNCTION_NAME](param)`.

  This is a helper method from the Astro Island library to create a randomized function name:

  ```js
  const FUNCTION_NAME =
    $actions.CreateFunctionProp("FUNCTION_NAME").UpdatedFunctionName;
  ```

  ![Set the function props content](../../../../../assets/odc/0.2/set-function-props-content.png)

- Right click on parameters and select `Add Output Parameter`.
  ![Set function props output parameter](../../../../../assets/odc/0.2/set-function-props-add-output-parameter.png)

- Set the name of the output paramter and the type to **Text**. This will be the randomized name of the function (in case multiple instances are instantiated). Click the **Done** button.
  ![Set function props output name and type](../../../../../assets/odc/0.2/set-function-props-output-name-type.png)

- Add an assign control and assign all of the input into the props parameter. That includes the output randomized name from the `SetFunctionProps`.
  ![Add assign](../../../../../assets/odc/0.2/add-assign-props.png)
  ![Assign local variable Props](../../../../../assets/odc/0.2/prepare-props-assign.png)

- Add the **JSON Serialize** element to the flow.
  ![Add JSON Serialize to PrepareProps](../../../../../assets/odc/0.2/prepare-props-json-serialize.png)

- Set the **Props** variable as the **Data** value.
  ![Set Props variable for JSON Serialize](../../../../../assets/odc/0.2/prepare-props-json-serialize-data.png)

- Depending on your use case, you may want to set the **_Serialize Default Values_** to true. Since OutSystems does not have the concept of [NULL values](https://success.outsystems.com/documentation/outsystems_developer_cloud/building_apps/data_management/data_types_and_conversions), this will send the Prop value even if there is no value passed. Without it enabled, the parameter will not be sent if no value is passed in. It is either all are sent or only the ones passed in. There is no way to pick which ones should be passed with a default element.

- Assign the serialized props to the `PropsSerialized` variable.
  ![Add assign block](../../../../../assets/odc/0.2/prepare-props-assign-serialized.png)
  ![Set output of JSON Serialized to param](../../../../../assets/odc/0.2/props-serialized-assign.png)

#### Initialize parameters

- Go to the library component and scroll down in the properties to create an OnInitialize handler.
  ![Add OnInitialize handler](../../../../../assets/odc/0.2/on-initialize-handler.png)

- Do the same thing for the OnParametersChange handler.
  ![Add OnParametersChanged handler](../../../../../assets/odc/0.2/on-parameters-changed-handler.png)

- Go back to the OnInitialize client action and drag over the created PrepareProps action.
  ![Add PrepareProps to OnInitalize hander](../../../../../assets/odc/0.2/on-initialize-prepare-props.png)

- Double click the OnParametersChanged and drag over PrepareProps.
  ![Add PrepareProps to OnParametersChanged hander](../../../../../assets/odc/0.2/on-parameters-changed-prepare-props.png)

## Import scripts and assets

### Importing JavaScript

- Go to the Data tab in ODC Studio. Right click on the Resources folder and add all of the output JavaScript and other resources.
  ![Import JavaScript resources](../../../../../assets/odc/0.2/import-resource.png)

- Set the Deploy Action to **Deploy to Target Directory**.
  ![Set the JavaScript property and Deploy Action](../../../../../assets/odc/0.2/js-resource-properties.png)

### Importing Images

- Follow the same process as the JavaScript. You will get a prompt asking if want to add the resource as an Image or a Resource. Click **Add as Resource**.
  ![Add an image resource](../../../../../assets/odc/0.2/import-image-resource.png)

### Add astro-island component

- Double click on the block you created. Search for the Astro Island component and drag it onto the screen.
  ![Import Astro Island component](../../../../../assets/odc/0.2/import-astroisland.png)

- Make sure you run the [Astro Island component generation](../astro/index.md) in the Node project.

- Look at the `output/index.html` file. It should have the `astro-island` component. For example:

```html
<astro-island
  uid="1GaTnF"
  component-url="/Counter_A64T-rlf.js"
  component-export="default"
  renderer-url="/client_SXSnjBQD.js"
  props="{""InitialCount"":[0,5],""ShowMessage"":[0,""showMessage""]}"
  ssr
  client="only"
  opts="{""name"":""CounterComponent"",""value"":""react""}"></astro-island>
```

- Click on the **ComponentURL** dropdown and select **Expression Editor**.
  ![Parameter set Island Component URL](../../../../../assets/odc/0.2/island-component-url.png)

- Scroll down in the bottom left section that has the variables until you get to the **Resources**. Click on the arrow to drop down the resources list. Find the resource that matches the **component-url** and click on the arrow to drop down more options. The URL variable should be displayed. Double click on the URL and it should populate the window. Once the resource variable is populated, click the **Close** button.
  ![Select Island Component URL value](../../../../../assets/odc/0.2/island-component-url-value.png)

- Click on the **RendererURL** dropdown and select **Expression Editor**.
  ![Parameter set Island Component URL](../../../../../assets/odc/0.2/island-renderer-url.png)

- Scroll down in the bottom left section that has the variables until you get to the **Resources**. Click on the arrow to drop down the resources list. Find the resource that matches the **renderer-url** and click on the arrow to drop down more options. The URL variable should be displayed. Double click on the URL and it should populate the window. Once the resource variable is populated, click the **Close** button.
  ![Select Island Renderer URL value](../../../../../assets/odc/0.2/island-renderer-url-value.png)

- Click on the **Props** dropdown and select `PropsSerialized`.
  ![Select Island Props value](../../../../../assets/odc/0.2/island-props.png)

- Click on the **Opts** dropdown and select **Expression Editor**.
  ![Select Island Opts parameter](../../../../../assets/odc/0.2/islands-opts.png)

- Enter the value from the `astro-island` `opts` parameter into the window and click the **Close** button.
  ![Select Island Opts value](../../../../../assets/odc/0.2/islands-opts-value.png)

### Add styles

If there are any output CSS styles, they must be added to the block CSS.

- Click on the block. Scroll down in the properties to Advanced -> Stylesheet and click the three dots on the input.
  ![Select stylesheet for the block](../../../../../assets/odc/0.2/styles-select-stylesheets.png)

- Enter any styles that are in an output `.CSS` stylesheet file.
  ![Add the CSS styles to the block](../../../../../assets/odc/0.2/styles-add-stylesheet.png)

### _Optional_: Create a visual representation

Since this is a JavaScript rendered element, nothing will appear in OutSystems Service Studio preview. Through the widget tree, you can create a visual representation of what your component will look like.

- In your component library, click on the component and select the Widget Tree.
  ![Select the Widget Tree tab](../../../../../assets/odc/0.2/visual-select-widget-tree.png)

- Right click on the elements and click **Enclose in If**.
  ![Select Enclose in If](../../../../../assets/odc/0.2/visual-enclose-if.png)

- Click on the If element and set the Condition to `False`. You can rename the If condition to make it easier to recognize the logic.
  ![Set If false branch](../../../../../assets/odc/0.2/visual-false-branch.png)

- The False branch will contain your component. You will have to drag it over from the True branch if its is in there. The True branch will contain your visual representation. The True branch will only show in ODC Studio.
  ![Visual layout of component](../../../../../assets/odc/0.2/visual-layout.png)

- If you have any images you want shown in the visual representation, you have to import them in to the images folder (even if you previously imported them as resources). Right click on the Images folder and say Add Image. Then select and upload your images.
  ![Visual representation add images](../../../../../assets/odc/0.2/visual-images.png)

### Publish

Make sure to publish your component.

### Import the component into your application

If you have created a library you can now import it into your application.
