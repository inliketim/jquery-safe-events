var failedFunctionExceptionRaised = false;

var failingHandler = function(){
  "use strict";
  throw "failed event handler";
};

/*
Because raising an exception is desired/tested behavior for some of the tests, we need to prevent normal test-suite error handling for that specific error.
Instead, we will just remember that the exception happened.
*/
var originalWindowErrorHandler = window.onerror;
var safeErrorHandler = function(msg, url, line, col, error){
  "use strict";
  if(msg==="failed event handler" || msg==="uncaught exception: failed event handler"){
    failedFunctionExceptionRaised = true;
  }
  else{
    originalWindowErrorHandler(msg, url, line, col, error);
  }
};
window.onerror = safeErrorHandler;

var secondSafeReadyHandlerExecuted = true;
$(document).safeReady(failingHandler);
$(document).safeReady(function(){
  secondSafeReadyHandlerExecuted = true;
});
QUnit.test("A failing handler for $().safeReady will not prevent other handlers for the same event from running.", function(assert){
  assert.ok(secondSafeReadyHandlerExecuted);
});

QUnit.test("Code after a call to $().trigger() doesn't run when an event handler for $().on() fails.", function(assert){
  "use strict";
  var ranCodeAfterTrigger = false;
  $(document).on("someEvent", failingHandler);
  var triggerEventAndDoSomeWork = function(){
    $(document).trigger("someEvent");
    ranCodeAfterTrigger = true;
  };
  assert.throws(triggerEventAndDoSomeWork, /failed event handler/);
  assert.notOk(ranCodeAfterTrigger);
  $(document).off("someEvent");
});

QUnit.test("Code after a call to $().safeTrigger() runs even when an event handler for $().on() fails.", function(assert){
  "use strict";
  var ranCodeAfterTrigger = false;
  $(document).on("someEvent", failingHandler);
  var triggerEventAndDoSomeWork = function(){
    $(document).safeTrigger("someEvent");
    ranCodeAfterTrigger = true;
  };
  triggerEventAndDoSomeWork();
  assert.ok(ranCodeAfterTrigger);
  $(document).off("someEvent");
});

// We want to test a number of event-binding methods, and all of them pretty much need the same setup and test structure.
var testFailingUnsafeHandlerPreventsOtherHandlers = function(eventName, bindingFunctionName, bindingFunction){
  "use strict";
  QUnit.test("A failing handler for $()." + bindingFunctionName + " will prevent other handlers for the same event from running.", function(assert){
    var secondHandlerExecuted = false;
    bindingFunction(failingHandler);
    bindingFunction(function(){
      secondHandlerExecuted = true;
    });
    var triggerEvent = function(){
      $(document).trigger(eventName);
    };
    assert.throws(triggerEvent, /failed event handler/);
    assert.notOk(secondHandlerExecuted);
  });
};

var testFailingSafeHandlerDoesNotPreventOtherHandlers = function(eventName, bindingFunctionName, bindingFunction){
  "use strict";
  QUnit.test("A failing handler for $()." + bindingFunctionName + " will not prevent other handlers for the same event from running.", function(assert){
    var secondHandlerExecuted = false;
    bindingFunction(failingHandler);
    bindingFunction(function(){
      secondHandlerExecuted = true;
    });
    var triggerEvent = function(){
      $(document).trigger(eventName);
    };
    assert.throws(triggerEvent, /failed event handler/);
    assert.notOk(secondHandlerExecuted);
  });
};


testFailingUnsafeHandlerPreventsOtherHandlers("someEvent", "bind", function(handler){
  $(document).bind("someEvent",handler);
});
$(document).unbind("someEvent");
testFailingSafeHandlerDoesNotPreventOtherHandlers("someEvent", "bind", function(handler){
  $(document).safeBind("someEvent",handler);
});
$(document).unbind("someEvent");

testFailingUnsafeHandlerPreventsOtherHandlers("someEvent", "on", function(handler){
  $(document).on("someEvent", handler);
});
$(document).off("someEvent");
testFailingSafeHandlerDoesNotPreventOtherHandlers("someEvent", "safeOn", function(handler){
  $(document).safeOn("someEvent", handler);
});
$(document).off("someEvent");


QUnit.test("A failing handler for $().on will prevent code after the call to $().trigger from running.", function(assert){
  "use strict";
  var ranCodeAfterTrigger = false;
  var triggerEventAndDoSomeWork = function(){
    $(document).off("someEvent");
    $(document).on("someEvent", failingHandler);
    $(document).trigger("someEvent");
    ranCodeAfterTrigger = true;
  };
  $(document).on("someEvent", failingHandler);
  assert.throws(triggerEventAndDoSomeWork, /failed event handler/);
  assert.notOk(ranCodeAfterTrigger);
});

QUnit.test("A failing handler for $().safeOn will not prevent code other handlers for the same event from running.", function(assert){
  "use strict";
  var secondHandlerExecuted = false;
  $(document).off("someEvent");
  $(document).safeOn("someEvent", failingHandler);
  $(document).on("someEvent", function(){
    secondHandlerExecuted = true;
  });
  var triggerEvent = function(){
    $(document).trigger("someEvent");
  };
  triggerEvent();
  assert.ok(secondHandlerExecuted);
});

QUnit.test("A failing handler for $().safeOn will not prevent code after the call to $().trigger from running.", function(assert){
  "use strict";
  var ranCodeAfterTrigger = false;
  var triggerEventAndDoSomeWork = function(){
    $(document).off("someEvent");
    $(document).trigger("someEvent");
    ranCodeAfterTrigger = true;
  };
  $(document).safeOn("someEvent", failingHandler);
  triggerEventAndDoSomeWork();
  assert.ok(ranCodeAfterTrigger);
});

QUnit.test("The alternate arguments format for $().on, with an object rather than a function, is not supported by $().safeOn. A SafeProxy.ArgumentsError will be thrown if this signature is used.", function(assert){
  "use strict";
  var jQueryEventsObject = new Object();
  var eventHandlerFired = false;
  jQueryEventsObject["someEvent"] = function(){
    eventHandlerFired = true;
  };
  $(document).on(jQueryEventsObject);
  $(document).trigger("someEvent");
  assert.ok(eventHandlerFired);
  $(document).off("someEvent");
  eventHandlerFired = false;
  try{
    $(document).safeOn(jQueryEventsObject);
  }
  catch (ex){
    assert.ok(ex instanceof SafeProxy.ArgumentError);
  }
  assert.ok(!eventHandlerFired);
});




