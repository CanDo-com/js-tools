Controllers, Services, Transformations
======================================

Controllers, services and transformations are three types of JavaScript code units within the js-tools application. 

**Controller** is responsible for defining the behaviour of a part of your page; it handles events triggered by user's 
actions, queries data from the server, renders HTML, manipulates with DOM, processes forms, and, in general, works as a 
bridge between the user and the deeper layers of your code. Controller is aware of the structure of the HTML element it
is linked to and is allowed to manipulate with the content of this element directly.

**Service** contains the code that is not specific to a certain piece of the user interface and can be used by any part 
of the application. Services provide all kind of functionality, including but not limited to API calls, rendering, form 
validation, event binding etc.

**Transformation** is the code that accepts a DOM node as a parameter and modifies it according to its rules. Every 
piece of HTML that has a controller attached to it, as well as any piece of HTML produces by js-tools rendering service
is passing through the transformations registered in the application. Transformations can be used to enrich HTML code 
with new attributes (for example, you can write ```<select data-selected="value">``` to make sure that value will be 
selected by default when HTML is loaded or rendered.


