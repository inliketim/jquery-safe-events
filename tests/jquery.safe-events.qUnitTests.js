'use strict';

var failedFunctionExceptionRaised = false;

var failingHandler = function(){
  throw "failed event handler";
};


/*
Because raising an exception is desired/tested behavior for some of the tests, we need to prevent normal test-suite error handling for that specific error.
Instead, we will just remember that the exception happened.
*/
var originalWindowErrorHandler = window.onerror;
var safeErrorHandler = function(msg, url, line, col, error){
  if(msg==="failed event handler" || msg==="uncaught exception: failed event handler"){
    failedFunctionExceptionRaised = true;
  }
  else{
    originalWindowErrorHandler(msg, url, line, col, error);
  }
};
window.onerror = safeErrorHandler;


QUnit.test("Code after a call to $().trigger() doesn't run when an event handler for $().on() fails.", function(assert){
  var ranCodeAfterTrigger = false;
  $(document).off("someEvent");
  $(document).on("someEvent", failingHandler);
  var triggerEventAndDoSomeWork = function(){
    $(document).trigger("someEvent");
    ranCodeAfterTrigger = true;
  };
  assert.throws(triggerEventAndDoSomeWork, /failed event handler/);
  assert.notOk(ranCodeAfterTrigger);
});

QUnit.test("Code after a call to $().safeTrigger() runs even when an event handler for $().on() fails.", function(assert){
  var ranCodeAfterTrigger = false;
  $(document).off("someEvent");
  $(document).on("someEvent", failingHandler);
  var triggerEventAndDoSomeWork = function(){
    $(document).safeTrigger("someEvent");
    ranCodeAfterTrigger = true;
  };
  triggerEventAndDoSomeWork();
  assert.ok(ranCodeAfterTrigger);
});

QUnit.test("A failing handler for $().on will prevent code other handlers for the same event from running.", function(assert){
  var secondHandlerExecuted = false;
  $(document).off("someEvent");
  $(document).on("someEvent", failingHandler);
  $(document).on("someEvent", function(){
    secondHandlerExecuted = true;
  });
  var triggerEvent = function(){
    $(document).trigger("someEvent");		
  };
  assert.throws(triggerEvent, /failed event handler/);
  assert.notOk(secondHandlerExecuted);
});

QUnit.test("A failing handler for $().on will prevent code after the call to $().trigger from running.", function(assert){
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




