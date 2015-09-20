/*
The MIT License (MIT)

Copyright (c) 2015 Tim Rozycki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Set up "safe" versions of JQuery methods dealing with events and handlers. By default,
// a failing JQuery event listener can prevent other listeners for the same event from executing.
// In some cases this may not be the desired behavior. 
// jquery-safe-events methods prevent exceptions from being raised until after all other listeners, 
// and the current block of code, finish executing.
// Exceptions will still be raised eventually and can be handled by window.onerror.

//jquery-safe-events requires SafeProxy.js
//http://github.com/inliketim/SafeProxy

new function(){
  // most JQuery methods we want to make safe will have a handler (function) passed as an argument.
  // safeParameters(method) will create a method just like the original method except that any incoming function parameters will be replaced with a safe version of the same function.
  safeParameters = function(funcToProxy){
    "use strict";
    var result = function(){
      var safeArguments = [];
      var functionParameterPassed = false;
      if(arguments && arguments.length){
        var i, unsafeArg;
        for (i=0; i < arguments.length; i += 1){
          unsafeArg = arguments[i];
          if(typeof(unsafeArg)==="function"){
            functionParameterPassed = true;
            safeArguments.push(SafeProxy.safe(unsafeArg));
          }
          else{
            safeArguments.push(unsafeArg);
          }
        }
      }
      if (!functionParameterPassed){
        throw(new SafeProxy.ArgumentError("At least one function argument is required"));
      }
      funcToProxy.apply(this, safeArguments);
    };
    return result;
  };
  //JQuery methods that set up event listeners and have one or more functions in their parameters:
  $.fn.safeOn = safeParameters($.fn.on);
  $.fn.safeBind = safeParameters($.fn.bind);
  $.fn.safeReady = safeParameters($.fn.ready);

  //JQuery methods that we want to make safe from any exceptions caused by calling them:
  $.fn.safeTrigger = SafeProxy.safe($.fn.trigger);
}();
