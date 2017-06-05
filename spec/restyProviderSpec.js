var sinon = require("sinon");

var restyProvider = require("Src/restyProvider");

describe("restyProvider", function() {

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
