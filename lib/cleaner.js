// remove public members
// delete K.DOM;
delete NR.S;
delete NR._;
// delete DOM.methods;
// delete DOM.feature;


// remove Slick from window
// Slick is defined with 'this.Slick'
// so, it's removable and is not [DontDelete]

// IE6 - IE8 don't support delete a property of window, even if it's defined with this.MyNameSpace 
// try{
//    delete window.Slick;
// }catch(e){
    // K.log('del Slick err');
// }
delete NR.Slick;