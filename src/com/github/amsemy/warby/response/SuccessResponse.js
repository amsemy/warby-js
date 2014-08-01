(function(ns) {

    'use strict';

    ns.unit('com.github.amsemy.warby.response.SuccessResponse', function() {

        return function(resp) {
            this.data = resp.data;
        };

    });

})(gumup);
