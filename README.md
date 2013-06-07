# neuro-dom

> DOM encapsulation based on cortex and neuron

## Getting Started
Before anything taking its part, you should install [node](http://nodejs.org) and "cortex".

#### Install Node

Visit [http://nodejs.org](http://nodejs.org), download and install the proper version of nodejs.

#### Install Cortex

    # maybe you should use `sudo`
    npm install -g cortex

## Using neuro-dom In Your Project

First, install 'neuro-dom' directly with `ctx install` (recommended)
	
	ctx install neuro-dom --save
	
or, you could update your package.json manually
    
    dependencies: {
        'neuro-dom': '<version-you-want>'
    }
    
and install dependencies
	
	ctx install
    
Then, use `require` method in your module
    
    var neuro-dom = require('neuro-dom');
    
Finally, start cortex server
    
    ctx server
    
Then cortex will care all the rest.


## API Documentation

### neuro-dom: constructor
': constructor' means the `module.exports` of module 'neuro-dom' is a constructor that we should use it with the `new` keyword

	new neuro-dom(options)
	
#### options
- options.name {String}



### neuro-dom.\<method-name\>(arguments)
Means this is a static method of `module.exports`

#### arguments
// arguments description here

### .\<method-name\>(arguments)
Mean this is a method of the instance

#### arguments
// arguments description here