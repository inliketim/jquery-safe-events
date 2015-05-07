# jquery-safe-events
By default, jQuery event handlers that throw an uncaught exception can prevent other event handlers for the same event from executing. Any code that runs immediately after an event is triggered can also be halted by a single failed event handler. 

This plugin creates "safe" versions of jQuery event-handling methods (like .ready, .on, .bind, .trigger, etc.) and allows your code to keep running after a bad event handler.

If some event handlers are outside of your control, not considered critical (like sending data to third party tracking tools), or you otherwise don't want them stopping your other code from running, you can use these "safe" event-related methods.

Example use:

```javascript
//before adding safe-events:
$('.submit_order').on('click', callThirdPartyTrackingScript());
//...
$('.submit_order').on('click', validateAndSubmitOrder());
// if callThirdPartyTrackingScript() fails, then validateAndSubmitOrder() might not execute.
```

```javascript
//after adding safe-events:
$('.submit_order').safe-on('click', callThirdPartyTrackingScript());
//...
$('.submit_order').on('click', validateAndSubmitOrder());
// even if callThirdPartyTrackingScript() fails, validateAndSubmitOrder() will always be executed.
// if validateAndSubmitOrder() fails, callThirdPartyTrackingScript() might not execute.
```

This plugin requires SafeProxy.js:
https://github.com/inliketim/jquery-safe-events
