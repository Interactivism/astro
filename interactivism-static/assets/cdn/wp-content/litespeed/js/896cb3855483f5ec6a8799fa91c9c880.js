(function(){var DRIFT_CHAT_SELECTOR='.drift-open-chat'
function ready(fn){if(document.readyState!='loading'){fn()}else if(document.addEventListener){document.addEventListener('DOMContentLoaded',fn)}else{document.attachEvent('onreadystatechange',function(){if(document.readyState!='loading')
fn();})}}
function forEachElement(selector,fn){var elements=document.querySelectorAll(selector);for(var i=0;i<elements.length;i++)
fn(elements[i],i);}
function openSidebar(driftApi,event){event.preventDefault();driftApi.sidebar.open();return!1}
ready(function(){drift.on('ready',function(api){var handleClick=openSidebar.bind(this,api)
forEachElement(DRIFT_CHAT_SELECTOR,function(el){el.addEventListener('click',handleClick)})})})})();drift.on("ready",api=>{api.widget.hide()})
;