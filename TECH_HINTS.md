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
