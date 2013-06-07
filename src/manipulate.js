/**
 * module  DOM/manipulate
     - basic method to manipulate DOMElements
     - initialize all specified DOM related methods defined in previous modules
 */
 
;(function(K, NULL, undef){

function hasClass(el, cls){
    var whitespace = WHITE_SPACE; 
    return (whitespace + el.className + whitespace).indexOf(whitespace + cls + whitespace) !== -1;
};

function addClass(cls){
    if(!hasClass(this, cls)){
        this.className = ( this.className + WHITE_SPACE + cls ).trim();
    }
};

function removeClass(cls){
    this.className = this.className.replace(new RegExp('(?:^|\\s+)' + cls + '(?:\\s+|$)'), ' ').trim();
};


function getStorage(el){
    var id = SELECTOR.uid(el);

    return data_storage[id] || (data_storage[id] = {});
};


// clear data stored in the specified element
// clear attributes
function cleanElement(el){
    var id = SELECTOR.uid(el),
        dom = new DOM(el);
        
    dom.off();
    
    el.clearAttributes && el.clearAttributes();
    
    K.each(storage, function(s){
        var m = '_clean';
        
        // if has a cleaner method, use it
        s[m] ? s[m](id) : delete s[id];
    });
};


/**
 * multiple setter or single getter

 * data({a:1})     -> iterative setter
 * data('a', 1) -> setter
 * data('a')    -> getter
 
 @this {DOM}
 
 @param {Object} methods object contains setter and getter methods
 @paran {number} getterArgLength
 
 <code:pseudo>
 - case 1:
     getter:
        get('value')    -> arg[0] == String, arg.len == 1 == getterArgLength
 
    setter:
         set('value', 1)    -> 
        set({value: 1})    -> arg[0] != String, arg.len = 1 => arg.len >= getterArgLength
        
 - case 0:
     getter:
         value();        -> arg.len == 0 == getterArgLength
     
     setter:
         value(1)        -> arg.len > 0 => arg.len >= getterArgLength
         
 </code:pseudo>
 */
function overloadDOMGetterSetter(methods, getterArgLength){
    return function(){
        var args = arguments,
            first_arg = args[0],
            
            type, 
            len = args.length, 
            getter_len = getterArgLength,
            m,
            hook_methods,
            no_getter_args = getter_len === 0;
        
        // getter    
        if(
            getter_len === len && 
            
            // value() || get('value')
            ( no_getter_args || K.isString(first_arg) )
        ){
            // getter always only deal with the value of the first element
            var first = this[0];
            
            // if no element found, return null
            return first ? methods.GET.call(first, first_arg) : null;
        
        // setter
        }else if(
            len >= getter_len &&
            
            // value(<whatever>) || set(<must not false>, <optional>)
            // don't judge the type of first_arg, which will be done in NR._overloadSetter
            ( no_getter_args || first_arg )
        ){
            m = methods.SET;
        
            m && this.forEach(function(el){
                m.apply(el, args);
            });
        }
        // else {
        //         ex: 
        //            .attr() -> getter_len = 1, len = 0
        //         do nothing
        // }
        
        return this;
    };
};


/**
 * @param {DOMElement|DOM} el native DOMElement or the instance of DOM
 * @return {DOMElement} native DOMElement(or the first context of DOM instance)
 */
function getFirstContext(element){
    if(typeof element === 'string'){
        element = DOM(element);
    }
    
    return element 
       && (element = element._ === atom ? element[0] : element) && element.nodeType ? 
           element : false;
};


/**
 * @param {string|NR.DOM|DOMElement|Array.<DOMElement>} element
 * @returns {Array.<DOMElement>}
 */
function getAllContexts(element){
    if(typeof element === 'string'){
        element = DOM(element);
    }

    return element && element._ === atom ? element.get() : makeArray(element).filter(function(el){
        return el && el.nodeType;
    });
};


// @this {DOMElement}
function disposeElement(){
    var parent = this.parentNode;
    parent && parent.removeChild(this);
};

// @this {DOMElement}
function emptyElement(){

    // IE6-7 fail to call Array.prototype.slice with NodeLists
    // use NR.makeArray instead
    makeArray(this.childNodes).forEach(function(child){
        disposeElement.call(child);
    });
};


function grabElements(element, elements, where){
    elements = getAllContexts(elements);
    if(where === 'top'){
        elements = elements.reverse();
    }
    
    elements.forEach(function(el){
        el && inserters[where || 'bottom'](el, element);
    });
};


function getOptionValue(el){
    var valueNode = el.getAttributeNode('value');
    return !valueNode || valueNode.specified ? el.value : el.text;
};


function santitizeValue(value){
    return value == null ? '' : value + '';
};


var DOM = K.DOM,
    SELECTOR = DOM.SELECTOR,
    storage = DOM.__storage,
    makeArray = K.makeArray,
    
    WHITE_SPACE = ' ',
    
    // @type {Object}
    // list of methods for both getter and setter
    METHODS = DOM.methods,
    
    data_storage = storage.data = {},
    atom = K._,
    
    TRUE = true,
    
    // .attr() method will no longer deal with 'html' and 'text' 
    // so they are now excluded in ATTR_CONVERT and ATTR_KEY
    
    ATTR_CONVERT = {
        // defaultvalue    : 'defaultValue',
        tabindex        : 'tabIndex',
        readonly        : 'readOnly',
        'for'            : 'htmlFor',
        'class'            : 'className',
        maxlength        : 'maxLength',
        cellspacing        : 'cellSpacing',
        cellpadding        : 'cellPadding',
        rowspan            : 'rowSpan',
        colspan            : 'colSpan',
        usemap            : 'useMap',
        frameborder        : 'frameBorder',
        contenteditable    : 'contentEditable' // ,
        // type            : 'type',
        // html            : 'innerHTML',
    },
    
    ATTR_TEXT = function(){
        var STR_TEXTCONTENT = 'textContent';
        
        // TODO: test if memleak
        return STR_TEXTCONTENT in document.createElement('div') ? STR_TEXTCONTENT : 'innerText';
    }(),
    
    ATTR_KEY = {
        // html    : TRUE,
        // text    : TRUE,
        'for'    : TRUE,
        'class'    : TRUE,
        type    : TRUE  // TODO: test readonly property
    },
    
    REGEX_IS_URI_ATTR = /^(?:href|src|usemap)$/i,
    
    ATTR_BOOLS = ['compact', 'nowrap', 'ismap', 'declare', 'noshade', 'checked', 'disabled', 'readOnly', 'multiple', 'selected', 'noresize', 'defer', 'defaultChecked'],
    
    inserters = {
        before: function(context, element){
            var parent = element.parentNode;
            parent && parent.insertBefore(context, element);
        },
    
        after: function(context, element){
            var parent = element.parentNode;
            parent && parent.insertBefore(context, element.nextSibling);
        },
    
        bottom: function(context, element){
            element.appendChild(context);
        },
    
        top: function(context, element){
            element.insertBefore(context, element.firstChild);
        }
    },
    
    val_traits = {
        option: {
            GET: getOptionValue 
        },
        
        select: {
            GET: function(el){
                var selected = el.options[el.selectedIndex];
                
                return selected ? getOptionValue(selected) : '';
            },
            
            SET: function(el, value){
                var values = makeArray(value);
                
                // in IE(tested up to IE9), <select>.options === <select>
                // so you couldn't makeArray el.options by detecting the type of el.options, but have to force making.
                makeArray.merge(el.options, []).forEach(function(option, i){
                    option.selected = values.indexOf( getOptionValue(option) ) !== -1;
                });

                if (!values.length) {
                    el.selectedIndex = -1;
                }
            }
        }
    };
    
    
// .attr() methods
METHODS.attr = {

    // arguments length of getter: 1
    len: 1,
    
    // attribute setter
    SET: K._overloadSetter( function(name, value){
        var prop = ATTR_CONVERT[name] || name;
        
        name in ATTR_KEY ? 
            this[prop] = value
            : ( ATTR_BOOLS.indexOf(prop) !== -1 ?
            
                this[prop] = !!value
                : this.setAttribute(prop, '' + value)
              );
    }),

    // attribute getter
    // @return {string|boolean}
    GET: function(name){
        var prop = ATTR_CONVERT[name] || name,
            attrNode;
        
        return name in ATTR_KEY ? 
            
            this[prop]
            : ( REGEX_IS_URI_ATTR.test(prop) ?
            
                // getAttribute(name, 2), return value as string
                // ref: http://msdn.microsoft.com/en-us/library/ms536429%28v=vs.85%29.aspx
                this.getAttribute(prop, 2)
                
                : ( ATTR_BOOLS.indexOf(prop) !== -1 ?
                    
                    // if is boolean attribute
                    !!this[prop]
                    
                    // ref: https://developer.mozilla.org/en/DOM/element.getAttributeNode
                    : ( (attrNode = this.getAttributeNode(prop)) ?
                        
                        attrNode.nodeValue
                        : NULL
                      )
                  ) 
              );
    }
};
    

// .data() methods
METHODS.data = {
    len: 1,
    
    SET: K._overloadSetter( function(name, value){
        var s = getStorage(this);
        s[name] = value;
    }),
    
    GET: function(name){
        var s = getStorage(this);
        return s[name];
    }
};
    

/**
 * .html() methods

 * no api equivalent to .set('html', '') of mootools
 * use .empty() instead to prevent memleak
 
 * .html() is a getter
 */
METHODS.html = {

    /**
     * avoid using .html('')
     * use .empty() instead
    
     * ref:
     * Creating and Manipulating Tables: http://msdn.microsoft.com/en-us/library/ms532998%28v=vs.85%29.aspx
     */
    SET: function(){
        var allow_table_innerHTML = false,
            table_test = document.createElement('table'),
            container = document.createElement('div'),
            WRAPPERS;
        
        try{
            table_test.innerHTML = '<tr><td></td></tr>';
            allow_table_innerHTML = true;
        }catch(e){}
        
        table_test = NULL;
        
        if(!allow_table_innerHTML){
        
            // in IE, which said by Microsoft: 
            // > However, because of the specific structure required by tables, 
            // > the innerText and innerHTML properties of the table and tr objects are read-only
            WRAPPERS = {
                table    : [1, '<table>', '</table>'],
                select    : [1, '<select>', '</select>'],
                tbody    : [2, '<table><tbody>', '</tbody></table>'],
                tr        : [3, '<table><tbody><tr>', '</tr></tbody></table>']
            };
            
            WRAPPERS.thead = WRAPPERS.tfoot = WRAPPERS.tbody;
        }

        return function(html){
            var wrapper = !allow_table_innerHTML && WRAPPERS[ this.tagName.toLowerCase() ];
                
            if(wrapper){
                var c = container, dimension = wrapper[0];
                c.innerHTML = wrapper[1] + html + wrapper[2];
                
                while(dimension --){
                    c = c.firstChild;
                };
                
                emptyElement.call(this);
                grabElements(this, c.childNodes);
                
            }else{
                this.innerHTML = html
            }
        };
    }(),
    
    GET: function(){
        return this.innerHTML;
    }
};

    
// .text() methods
METHODS.text = {
    SET: function(text){
        emptyElement.call(this);
        this[ATTR_TEXT] = text;
    },
    
    GET: function(){    
        return this[ATTR_TEXT];
    }
};


// .val() methods
METHODS.val = {
    SET: function(value){
        // prevent set window or document
        if(this.nodeType !== 1){
            return;
        }
    
        var tag = this.nodeName.toLowerCase(),
            method = val_traits[tag];
            
        method && ( method = method.SET );
            
        value = K.isArray(value) ? value.map(santitizeValue) : santitizeValue(value);
            
        method ? method(this, value) : (this.value = value);
    },
    
    GET: function(){
        var tag = this.nodeName.toLowerCase(),
            method = val_traits[tag];
            
        method && ( method = method.GET );
            
        return method ? method(this) : this.value;
    }
};


DOM.extend({

    addClass: addClass,
    
    removeClass: removeClass,
    
    toggleClass: function(cls){
        hasClass(this, cls) ? removeClass.call(this, cls) : addClass.call(this, cls);
    },
    
    removeData: function(name){
        if(name === undef){
            var id = SELECTOR.uid(this);
            id && delete data_storage[id];
        }else{
            var s = getStorage(this);
            delete s[name];
        }
    },
    
    removeAttr: function(name){
        var prop = ATTR_CONVERT[name];
            
            name in ATTR_KEY ? this[prop] = ''
                : ATTR_BOOLS.indexOf(prop) !== -1 ? this[prop] = false
                    : this.removeAttribute(prop);
    },
    
    inject: function(element, where){
        element = getFirstContext(element);
        element && inserters[where || 'bottom'](this, element);
    },
    
    dispose: disposeElement,
    
    empty: emptyElement
    
}, 'iterator'


).extend({
    hasClass: function(cls){
        return hasClass(this[0], cls);
    },
    
    // @param {string|DOMElement} selector
    is: function(selector){
        return !!selector && SELECTOR.match(this[0], selector);
    },

    grab: function(elements, where){

        // only grab into the first element
        this[0] && grabElements(this[0], elements, where);
    },
    
    destroy: function(){
        var self = this;
        
        self.forEach(function(el, i){
            var children = K.makeArray( el.getElementsByTagName('*') );
            
            children.push(el);
            children.forEach(cleanElement);
            disposeElement.call(el);
            
            // remove the element from the set
            delete self[i];
        });
        
        self.length = 0;
        
        return NULL;
    }
});


// extend setter and getter(batch or single) methods
K.each(METHODS, function(method, name){
    this[name] = overloadDOMGetterSetter(method, method.len || 0);
    delete method.len;
});


DOM.extend(METHODS);

DOM._overload = overloadDOMGetterSetter;

})(NR, null);


/**
 change log:
 2012-04-05  Kael:
 - remove 'html' and 'text' from ATTR_KEY
 - fix a bug of setting the value for a `<select>`
 
 TODO:
 A. support and detect boolean attributes for further standards
 
 2012-03-31  Kael:
 - no longer overload DOM::attr method for 'html' and 'text' arguments, and must use .html() and .text() methods instead.
 
 2011-12-20  Kael:
 - [TODO.11-02.A] fix the getter for 'checked' and other boolean attributes
 
 TODO:
 A. refractor attr trait for better upwards compatibility
 
 2011-11-02  Kael:
 - change implementation of removeClass to eliminate unexpected whitespace

 TODO:
 √ A. deal with getter and setter of boolean attributes
 B. refractor for native events and custom events
 C. overload arguments of DOM.grab
 
 2011-10-17  Kael:
 - fix a but about DOM.destroy
 
 2011-10-12  Kael:
 - fix a bug that ie fails on collections, use NR.makeArray instead of Array.prototype.slice
 - complete .val() method
 - optimize NR.makeArray invocations
 
 TODO:
 A. santitize element value
 
 2011-09-12  Kael:
 TODO:
 A. review .inject and .grab. whether should only deal with the first element of all matches
 B. deal with more elements of tables, such as caption, colgroup, etc
 
 2011-09-08  Kael:
 - improve stability of function overloadDOMGetterSetter
 - add method hooks, DOM.methods
 TODO:
 A. overloadDOMGetterSetter: add support for iterative setters
 
 2011-09-07  Kael:
 - complete methods about attributes manipulation
 
 TODO:
 A. add .html(), .text() hook to .attr() method
 B. test readonly props
 C. test if memleak
 
 2011-09-05  Kael:
 - complete basic functionalities
 
 */