describe("Already existing publications notified exist", function () {
    describe("Already existing publication appears", function () {
        describe("It is older than 5 days", function () {

            let service

            beforeEach(function () {
                jest.mock('../src/dao/meli-dao')
                jest.mock('../src/notifications/notifier')
                jest.mock('telebot')
                service = require('../src/service/meli-service')
            })

            afterEach(() => {
                jest.clearAllMocks();
            })

            it("Notify again and update last time notified", function () {
                jest.spyOn(service, 'getCategories').mockReturnValue(new Promise(function (resolve, reject) {
                    resolve([])
                }))
                jest.spyOn(service, 'notify').mockImplementation()

                service.retrieveCheapFullProducts()

                expect(service.notify).toHaveBeenCalledWith(
                    expect.arrayContaining([])
                )
            })
        })
    })
})