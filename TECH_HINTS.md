# Hints for learning the project technologies

These are not full guides or tutorials, but may be helpful for better understanding the key details about the technologies we will use.

Feel free to add (via pull request) information or links you find helpful or important.

## About TypeScript and JavaScript

The programming language used in this project is TypeScript, which is closely related to JavaScript and quite different from C and C++ which we are used to.

<details>

TypeScript is mostly an extension of JavaScript with support for type annotations and type assertions, with minor changes to prevent syntax conflicts.
TypeScript sometimes adopts proposed JavaScript features before they are fully standardized or supported in JavaScript runtimes.
The TypeScript compiler removes the TypeScript specific syntax and translates newer features to older code supported by JavaScript runtimes.
The compiler does a lot of type inferencing, similar to using `auto` in C++, but sometimes you need to help it with explicit type annotations.
Generally, function argument types need to be specified, and it's a good idea to specify return types too as the deduced return type may be more specific or more generic than intended.

JavaScript is a dynamically typed language - variables and object properties don't have types, values do.
You can assign values of different types to the same variable or property.
This is error-prone, and with TypeScript we generally want to avoid this, or at least restrict which types are allowed.

In C and C++ we need to specify structs to keep related data together.
In JavaScript, we have objects (`{}`), which can store arbitrary named properties and dynamically add or remove them.
Similar to variable types, having a random collection of properties is difficult to work with, so with TypeScript we use `interface` to specify the properties we expect a particular object to have.

JavaScript is a garbage collected language - the JavaScript runtime determines which data is still reachable, and releases anything not reachable.
There is no need to allocate and release memory manually, and it is not possible to have memory leaks by losing reference to an allocation.
It is still possible to have logical memory leaks though, by keeping old data reachable through current data structures even when not needed.

JavaScript functions capture variables from their surroundings, similar to C++ lambda but automatic and always by reference.
Because of the automatic memory management, we don't need to worry about the captured variable being destroyed too early.
However we need to be mindful of what exactly we capture and which other code can see changes when capturing non-constant variables.
Functions specified with the arrow syntax (`(args) => expression` or `(args) => { body }`) even capture special variables like `this`, losing the special meaning!

</details>

## Async programming

When writing code that runs in a web browser or Node.js server, we need to get used to asynchronous programming.

<details>

JavaScript code running on a web page or in Node.js can't just stop to wait for something to happen, because that would freeze the entire browser tab or the entire server process.
Instead we work with callback functions, or their alternatives, promises and async-await.
Any code that runs must return quickly, but may set up event handlers to be triggered externally or start asynchronous operations that trigger a callback when complete.

The classic model is callbacks.
Asynchronous operations, like background requests in the browser, and almost everything interacting with the external world in Node.js, take a callback function as a parameter.
If and when the operation completes successfully, the callback is called with `null` for the first parameter (indicating no error), and actual data in subsequent parameters, if applicable.
If and when the operation fails, the callback is called with an error object as the first parameter.

An alternative to direct callback functions is promises.
Promise is an object that represents some asynchronous operation that will eventually complete successfully or fail.
Promise objects can be stored in variables or returned from functions like any object.
The code that cares about the result can assign success and failure callbacks on the promise object instead of needing to pass a callback function through other code to the actual asynchronous operation.
We probably don't use promises much directly, but they are a key detail of async-await.

Async-await allows a more linear programming style, avoiding the readability issues of splitting your code into multiple nested callbacks.
A function marked with the `async` keyword may use `await` keyword on a promise value to suspend the code until the promise completes and return control to its caller.
The await operation either returns the value of the promise if it succeeds, or throws an exception if the promise fails.
The async function itself returns a promise, which eventually succeeds if the async function returns, or fails, if the async function throws an exception.

Event mechanisms are a variation of callbacks, where the callback function is not necessarily tied to a single operation.
The registered event handler is called whenever the event is triggered, for example the user clicks a particular button on the page.
When the handler function runs, it can do whatever it sees fit, like send a request to a server, or modify the page.
If we don't want to do the exact same actions on subsequent clicks, it needs to unregister itself or set some state that alters its behavior.

We should generally use async-await where possible.
When waiting for multiple operations at the same time, it may be necessary to interact with the promises directly.
Plain callbacks may be used on one-off basis if no awaitable version is provided, but if we end up writing nested callbacks we should probably write our own promise wrapper for it.
Event handlers don't directly map to promises or async-await, but the event handling function can be async as long as it doesn't let exceptions escape.

</details>

## How React works

React tutorials often go straight to practical examples, and may neglect to explain key terms like element and component, or to describe how React actually works.
These explanations may be unnecessary for working with React, but I find it helpful to understand what is going on instead of treating your tools as magic.

<details>


React elements are data objects that tell the React library *what* you want to display.
Elements specify a component type and "props" or parameters that pass additional data to the component.
Elements are technically just JavaScript objects, but they are typically created using JSX, an extension syntax that resembles HTML or XML.
JSX is translated to plain JavaScript by the build tools.
JSX elements can specify content between their opening and closing tags, which is passed as the `children` prop.
The `children` prop should generally specify more elements, although custom components can use it however they want.

React components are definitions that tell the React library *how* to display things.
Components can be either basic types for the platform, like HTML tags for Web, or custom components specified in the project or a library.
Custom components can contain logic, store state, and they should produce more elements for React to render.
In modern React components are specified as a single function which is called by React whenever it needs to render an instance of that component.
It receives props as argument and can call "hook" functions that request the React library to store state for that particular instance.
In older React code you may see components specified as classes, with the React library creating instances of the class and calling methods of those instances.

When the page initially loads, the code requests React to display a root element.
React creates a component instance for that element and ask the instance to render itself, producing even more elements which are processed recursively.
When the recursive processing completes, React walks the tree of component instances and asks the browser to create the actual HTML DOM elements matching the HTML components in the tree.
The props of HTML components are translated to HTML attributes.

When something happens that should change the page - user clicks a button, a background request completes, etc., a callback specified by the programmer is executed.
The callback may do some processing, and then asks React to update the state of some component instance.
In response to the state change, React re-renders that component - which in turn causes a re-render of its children.
When the recursive processing completes, React updates the HTML DOM to match the updated subtree.

To preserve state of component instances during updates, React attempts to reuse existing component instances for matching elements produced by the re-render of the parent component.
To prevent reuse of unrelated component instances, you can specify the `key` prop, which must match the previous value to allow reuse.

</details>

## Next.js

Next.js is an opinionated framework for full stack React apps. It comes with its own learning curve, but here are some quick notes to get started.

<details>

Next.js comes with many features and tools configured out of the box, including some which we might not care about.
We'll figure these out as we work on the project.

Next.js is its own backend server.
It can be run in development mode, which allows dynamic updates, showing changes in web browser as soon as you save files in your editor.
For deploying the completed project (and testing along the way), we'll want to instead build the app and then start it.

`src/app/` directory is where Next.js-managed parts of the application live.
Subdirectories of `src/app/` create subdirectories visible in the URL, while special filenames like `route.ts` or `page.tsx` within those directories create backend API routes or frontend pages and views.
We will also need to create React components which are not pages by themselves, and backend functions or modules which are not API endpoints themselves.
Such code *can* be written in any file not handled by Next.js, but for clarity, they should be organized either in directories prefixed with underscore (`_utility`), or entirely outside `src/app/` (but inside `src/`).

Next.js does server side rendering by default, which means React code can't directly handle user interaction or use browser APIs.
We consider all React code to be "frontend" in our project, even if it runs on the server.
When we do need direct interaction or browser API access, we need to specify components as client-side components (triggered with `'use client';`, see `src/app/client-component/page.tsx`).

Backend functionality is directly available during server-side rendering.
Backend functionality that needs to be available from client-side code or as an external API must be exposed as an API route (see `src/app/api/health/route.ts`).

*To be expanded*

</details>

## React-three-fiber

React-three-fiber is an alternative renderer for React that adds Three.js graphics primitives as basic component types, and therefore allows using React to describe and update our 3D graphical scene.
It also allows clean integration of the Three.js canvas into the top level React app without having to manually manage its lifecycle.

*To be expanded*
