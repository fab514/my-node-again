# Mixins
- In JS you can only inherit from a single object. There can only be one prototype for an object. A mixin is a class containing methods that can be used by other classes without a need to inherit it. 

# Random
- Remember that backticks `` generates a string instead of hard coding a string. 

## Adding or updating a store. Use /add to add a store and interpelation to update a store. 
- `/add/${store._id || ''}` 
- If there is no store id return as an empty string add a store. If there is already a store id keep the store id and edit the store instead. This uses the same template. 

- use POST when a form is submitted. This will keep the information from being added to the url

- when you want to generate an attribute you must use the es6 `${}`
- if you want to put a variable inside of text content of node use #{}