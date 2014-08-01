(function(ns) {

    'use strict';

    ns.unit('com.github.amsemy.warby.response.InvalidResponse', function() {

        return function(resp) {
            this.errors = resp.errors;
        };

    });

})(gumup);
