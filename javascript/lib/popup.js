//dom have on function
require("./lib/popup")();

function Popup(container){
    this.wrapper = container;
    this.hidden = false;
    container.delegate("click", ".js-close-popup", this.hideAll.bind(this));
}

Popup.prototype = {
    show: function (it) {
        var name = it;
        if ((!it) || (!it.toString().length)) {
            return false;
        }
        var elem = this.wrapper.querySelector("#popup_" + name);
        if (elem) {
            this.hideAll(true);
            lastShown = name;
            this.wrapper.removeClass("dn");
            this.hidden = false;
            elem.removeClass("dn");
            return true;
        }
        return false;
    },
    flashShow: function(it){
        this.show(it);
        setTimeout(function() {
            this.hideAll();
        }, 3000);
    },
    hideAll: function () {
        this.wrapper.addClass("dn");
        Array.prototype.forEach.call(
            this.wrapper.children,
            function (elem) {
                elem.addClass("dn");
            }
        );
        this.hidden = true;
    },
}

module.exports = Popup;