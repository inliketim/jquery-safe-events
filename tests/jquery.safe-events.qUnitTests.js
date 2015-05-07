/*
Because raising an exception is desired/tested behavior for some of the tests, we need to prevent normal test-suite error handling for that specific error.
Instead, we will just remember that the exception happened.
*/
failedFunctionExceptionRaised = false
originalWindowErrorHandler = window.onerror
window.onerror = function(msg, url, line, col, error){
	if(msg=="failed function" || msg=="uncaught exception: failed function"){
		failedFunctionExceptionRaised = true;
	}
	else{
		originalWindowErrorHandler(msg, url, line, col, error);
	}
};
		
failingHandler = function(){
	throw "failed event handler";
};

QUnit.test("Code after a call to $().trigger() doesn't run when an event handler for $().on() fails.", function(assert){
	var ranCodeAfterTrigger = false;
	$(document).on("someEvent", failingHandler)
	triggerEventAndDoSomeWork = function(){
		$(document).trigger("someEvent");
		ranCodeAfterTrigger = true;
	};
	assert.throws(triggerEventAndDoSomeWork, /failed event handler/);
	assert.notOk(ranCodeAfterTrigger);
});

QUnit.test("Code after a call to $().safeTrigger() runs even when an event handler for $().on() fails.", function(assert){
	var ranCodeAfterTrigger = false;
	$(document).on("someEvent", failingHandler)
	triggerEventAndDoSomeWork = function(){
		$(document).safeTrigger("someEvent");
		ranCodeAfterTrigger = true;
	};
	triggerEventAndDoSomeWork();
	assert.ok(ranCodeAfterTrigger);
});







