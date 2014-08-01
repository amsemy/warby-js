(function(ns, $, _, Backbone) {

    $(document).ready(function() {

        ns.inject({
            injections: [
                {
                    name: 'lib.$',
                    value: $
                },
                {
                    name: 'lib._',
                    value: _
                },
                {
                    name: 'lib.Backbone',
                    value: Backbone
                }
            ]
        });

        ns.init();

    });

})(gumup, $, _, Backbone);
