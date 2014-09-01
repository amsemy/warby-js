(function(ns, sinon) {

    var unit = ns.unit('com.github.amsemy.warby.restyBodyReaderSpec', implementation);

    unit.require('com.github.amsemy.warby.restyProvider');

    function implementation(units) {
        var restyProvider = units.com.github.amsemy.warby.restyProvider;

        describe("com.github.amsemy.warby.restyProvider", function() {

            var reponses = {
                failure: {
                    status: "FAILURE"
                },
                invalid: {
                    errors: [
                        "Validation error"
                    ],
                    status: "INVALID"
                },
                success: {
                    data: {
                        id: 1
                    },
                    status: "SUCCESS"
                }
            };

            it("должен парсить ответ resty-сервиса", function() {
                var successSpy = sinon.spy(),
                    errorSpy = sinon.spy();
                var options = {
                    success: successSpy,
                    error: errorSpy
                };
                restyProvider(null, options);

                //--------------------------------------------------------

                options.success(reponses.failure);
                expect(successSpy.called).toBeFalsy();
                expect(errorSpy.called).toBeTruthy();
                expect(errorSpy.firstCall.args.length).toBe(0);

                successSpy.reset();
                errorSpy.reset();

                //--------------------------------------------------------

                options.success(reponses.invalid);
                expect(successSpy.called).toBeFalsy();
                expect(errorSpy.calledWith(reponses.invalid.errors))
                    .toBeTruthy();

                successSpy.reset();
                errorSpy.reset();

                //--------------------------------------------------------

                options.success(reponses.success);
                expect(successSpy.calledWith(reponses.success.data))
                    .toBeTruthy();
                expect(errorSpy.called).toBeFalsy();
            });

        });

    }

})(gumup, sinon);
