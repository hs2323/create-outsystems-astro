# OutSystems Astro Islands Development Instructions

## Project Context
- This is not an Astro project that will be deployed on its own. It is only used for the output generation.
- The output generation will be only client side. No server side rendering or server side components will be used.
- The Astro Islands can be used generated with the following frameworks:
    - React
    - Vue
- Prefer to use TypeScript when possible.

## OutSystems
- This project works for OutSystems 11 (O11) Reactive and OutSystems Developer Cloud (ODC). It does not work with OutSystems 11 Traditional projects.
- The documentation for importing a component into OutSystems 11 is availabe at https://hs2323.github.io/create-outsystems-astro/guides/outsystems/o11/.
- The documentation for importing a component into OutSystems 11 is availabe at https://hs2323.github.io/create-outsystems-astro/guides/outsystems/o11/.

## Development

### Starting project
- The project can intialized from the Create OutSystems Astro package (https://www.npmjs.com/package/create-outsystems-astro).
- In this document, for any reference to running package manager script, the ```PM``` attribute should be replaced with whatever package manager the user is using.

### Pages
- The files in src/pages/*.astro are used as a starting point and holds the components for generation.  They can be tested by running ```npm run dev```. That will show what the component looks like as rendered. The sample example pages are broken out by framework name (src/pages/react, src/pages/vue, etc).  This page will house the component(s) entry points. 
- When importing a component, the component must have the attribute of the client:only= + the framework name.
    - React: ```client:only="react"```.
    - Vue: ```client:only="vue"```.

### Components
- The components live in the folder framework/[NAME]/ (src/framework/react, src/framework/vue, etc)) with each framework having its own folder. This is recommended but can be renamed to something else.

### Parameters
- Parameters are assigned as attributes on the component. Each framework will then handle them as incoming parameters.
- OutSystems will pass in parameters already prepared for the ````<astro-island>```. It already has copied the Astro method of serialization in https://github.com/withastro/astro/blob/main/packages/astro/src/runtime/server/serialize.ts.

#### Slots
Astro slots can be sent in.  A slot can be either the default one or the named one.  Each framework handles slots differently. Slots can only be HTML elements and cannot be components of a framework.

##### React
- In React, slots are handled as props.  The default slot is the ```children``` prop. A named slot will have the name of its slot as the parameter. For example, a slot with the following:
```js
<div slot="header">
```
will have the parameter named header. 
- The slots are then rendered using the regular React rendering parameter method.  With the following Astro component:
```js
---
import CounterComponent from '../../framework/react/Counter';
---
<CounterComponent client:only="react">
    <div slot="header">
        Counter
    </div>
    <div style="text-align: center;">
        <p>Slot content!</p>
    </div>
</CounterComponent>
```
the slots will render as:
```js
export default function Counter({
	children,
	header,
}: {
	children: React.ReactNode;
	header: React.ReactNode;
}) {

	return (
		<>
            {header}
			<div>
				{children}
			</div>
		</>
	);
}

```

##### Vue
- In Vue, slots are handled as by using the <slot /> tag.  The default slot is the is just <slot />. A named slot will have the name of its slot as an attribute such as <slot name="header" />. Placement of the slot will determine where the slot will render.

### Testing
- No testing is built into this generator.  It is recommended to use best practices for each framework. For example, in React, use Vitest for unit testing, React Testing Library for integration testing of components and PlayWright for end-to-end testing.

### Linting and formatting
- No linting or formatting is built into this generator. It is recommended to add Prettier for formatting and ESLint for linting.

### TypeScript
- If using TypeScript, it is recommended to do a TypeScript check.

### Handlers
- Incoming functions from OutSystems cannot be passed as function handlers. The way that OutSystems will invoke them  is by binding the function with the name to the ```document``` object of the page.  Then it will pass in that name as a parameter.  For example, if you need a function handler of ```ShowMessage```, it will need to be called as ```document[ShowMessage]```.
- Passing in basic text, number and boolean should be fine to the handler. Any array or object must be JSON stringified prior to being passed into the handler.

## Generating output
- The ```.env.template``` must be copied over to ```.env```.
- The name of the module/library/application where the component will live must be set in the ```ASSET_URL``` variable of the ```.env``` file.
- Run the command ```PM run output```. This will run the Astro build and then run an additional step to generate the output necessary for importing into OutSystems.
- The output will be in the output/ folder. The contents are:
    - HTML file(s) *.html:
        - This will contain only the ```<astro-island>``` component. It will be necessary for the users to copy over the ```component-url```, ```renderer-url``` and ```opts```. The rest will either be custom built in OutSystems or not needed. The ```uid``` will be generated by OutSystems. The ```component-export```, ```client```, ```ssr``` and ```await-children``` will be automatically added in the OutSystems Islands module.  
        - The slot content will be converted and parsed in a way that can be then dropped in as text directly into the OutSystem parameter.
    - JavaScript files *.js:
        - The JavaScript files will be imported as resources and then mapped as parameters when importing the Islands module.
    - Asset files:
        The ```/assets``` folder may contain images, stylesheets and other assets.  For images, they should be copied in as resources into the module/library/component/application.  Any CSS must be manually copied from the ```.css``` files and manually imported into the project or the block level CSS.
