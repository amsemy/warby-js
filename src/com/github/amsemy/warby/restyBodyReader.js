(function(ns) {

    'use strict';

    ns.unit('com.github.amsemy.warby.restyProvider', function() {

        return function(model, options) {
            var success = options.success;
            options.success = function(resp) {
                switch (resp.status) {
                    case "INVALID":
                        if (options.error) {
                            options.error(resp.errors);
                        }
                        break;
                    case "SUCCESS":
                        if (success) {
                            success(resp.data);
                        }
                        break;
                    default:
                        if (options.error) {
                            options.error();
                        }
                }
            };
        };
    });

})(gumup);
