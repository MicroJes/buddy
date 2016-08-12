var DEFAULT_OPT = Object.freeze({
	place: "beforeend",
	array: false,
	templatePrefix: "template_",
	wrapperPrefix: "wrap_",
});


// Inject({
//    "templateId":"1",
//    "wrapId":"asdfasd"
// })
function inject(opt){

    var options = _.defaults(opt || {}, DEFAULT_OPT);

    var templateId = option.templateId ? option.templateId : option.templatePrefix + name,
        wrapId = option.wrapId ? option.wrapId : option.wrapperPrefix + name,
        template = document.getElementById(templateId),
        wrapper = document.getElementById(wrapId),
        lastEventListener;

        var modelo = _.template(template.innerHTML);

        return function(data){
            //create template html
            var templateHtml;
            if (!options.array) {
                templateHtml = function (data) {
                    return modelo(data || {});
                }
            }
            //template html inject  wrappre  with place
            if (option.place !== "replace") {
                    wrapper.insertAdjacentHTML(option.place, str);
            } else {
                wrapper.innerHTML = str;
            }
        }
}

