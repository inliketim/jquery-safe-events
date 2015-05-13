failedFunctionExceptionRaised = false

failingHandler = function(){
  throw "failed event handler";
};


/*
Because raising an exception is desired/tested behavior for some of the tests, we need to prevent normal test-suite error handling for that specific error.
Instead, we will just remember that the exception happened.
*/
originalWindowErrorHandler = window.onerror
safeErrorHandler = function(msg, url, line, col, error){
  if(msg=="failed event handler" || msg=="uncaught exception: failed event handler"){
    failedFunctionExceptionRaised = true;
  }
  else{
    debugger
    originalWindowErrorHandler(msg, url, line, col, error);
  }
};
window.onerror = safeErrorHandler;


QUnit.test("Code after a call to $().trigger() doesn't run when an event handler for $().on() fails.", function(assert){
  var ranCodeAfterTrigger = false;
  $(document).off("someEvent");
  $(document).on("someEvent", failingHandler);
  triggerEventAndDoSomeWork = function(){
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
  triggerEventAndDoSomeWork = function(){
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
  triggerEvent = function(){
    $(document).trigger("someEvent");		
  };
  assert.throws(triggerEvent, /failed event handler/);
  assert.notOk(secondHandlerExecuted);
});

QUnit.test("A failing handler for $().on will prevent code after the call to $().trigger from running.", function(assert){
  var ranCodeAfterTrigger = false;
  triggerEventAndDoSomeWork = function(){
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
  triggerEvent = function(){
    $(document).trigger("someEvent");		
  };
  triggerEvent();
  assert.ok(secondHandlerExecuted);
});

QUnit.test("A failing handler for $().safeOn will not prevent code after the call to $().trigger from running.", function(assert){
  var ranCodeAfterTrigger = false;
  triggerEventAndDoSomeWork = function(){
    $(document).off("someEvent");
    $(document).trigger("someEvent");
    ranCodeAfterTrigger = true;
  };
  $(document).safeOn("someEvent", failingHandler);
  triggerEventAndDoSomeWork();
  assert.ok(ranCodeAfterTrigger);
});





