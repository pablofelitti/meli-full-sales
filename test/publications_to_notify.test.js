describe("Already existing notified publications exist", function () {
    describe("Already existing publication appears", function () {
        describe("It is older than 10 days", function () {

            let mockSaveNotifiedPublication = jest.fn(() => {
                return new Promise(function (resolve, reject) {
                    resolve()
                })
            })
            let mockNotify = jest.fn()

            jest.mock('../src/utils/date-utils', () => {
                return {
                    currentDate: function () {
                        let timestamp = Date.parse("07/30/2021")
                        return new Date(timestamp)
                    }
                }
            })

            jest.mock('../src/dao/meli-dao', () => {
                return {
                    loadBlacklist: function () {
                        return new Promise(function (resolve, reject) {
                            resolve([])
                        })
                    },
                    loadAlreadyNotifiedPublications: function () {
                        return new Promise(function (resolve, reject) {
                            resolve([{
                                "id": "MLA855969004",
                                "title": "Regaton Plastico Interior Rectangular 60x40 Mm X 10 Unid",
                                "price": "446",
                                "notified_date": "2021-07-13T03:00:00.000Z"
                            }])
                        })
                    },
                    saveNotifiedPublication: mockSaveNotifiedPublication,
                    getCategories: function () {
                        return new Promise(function (resolve, reject) {
                            resolve([
                                {
                                    "id": "MLA5726",
                                    "name": "Electrodomésticos y Aires Ac."
                                }
                            ])
                        })
                    },
                    getPublicationsWithFilters: function (categoryId) {
                        if (categoryId.id === 'MLA5726') {
                            return new Promise(function (resolve, reject) {
                                resolve([{
                                    "id": "MLA749158328",
                                    "title": "Mercado Pago Kit Point Mpos + Código Qr",
                                    "price": 99,
                                    "permalink": "https://articulo.mercadolibre.com.ar/MLA-749158328-mercado-pago-kit-point-mpos-codigo-qr-_JM"
                                }])
                            })
                        }
                    }
                }
            })

            jest.mock('../src/notifications/notifier', () => ({
                notify: mockNotify
            }))

            let service = require('../src/service/meli-service')

            afterEach(() => {
                mockNotify.mockReset()
            })

            it("Notify again and update last time notified", async function () {

                await service.retrieveCheapFullProducts()

                expect(mockNotify).toHaveBeenCalled()
                expect(mockSaveNotifiedPublication).toHaveBeenCalledWith(expect.arrayContaining([
                    ["MLA749158328", "Mercado Pago Kit Point Mpos + Código Qr", 99, new Date(Date.parse("07/30/2021"))]
                ]))
            })
        })

        describe("It is newer or equals than 10 days", function () {

            let mockSaveNotifiedPublication = jest.fn(() => {
                return new Promise(function (resolve, reject) {
                    resolve()
                })
            })
            let mockNotify = jest.fn()

            jest.mock('../src/utils/date-utils', () => {
                return {
                    currentDate: function () {
                        let timestamp = Date.parse("07/30/2021")
                        return new Date(timestamp)
                    }
                }
            })

            jest.mock('../src/dao/meli-dao', () => {
                return {
                    loadBlacklist: function () {
                        return new Promise(function (resolve, reject) {
                            resolve([])
                        })
                    },
                    loadAlreadyNotifiedPublications: function () {
                        return new Promise(function (resolve, reject) {
                            resolve([{
                                "id": "MLA855969004",
                                "title": "Regaton Plastico Interior Rectangular 60x40 Mm X 10 Unid",
                                "price": "446",
                                "notified_date": "2021-07-13T03:00:00.000Z"
                            }])
                        })
                    },
                    saveNotifiedPublication: mockSaveNotifiedPublication,
                    getCategories: function () {
                        return new Promise(function (resolve, reject) {
                            resolve([
                                {
                                    "id": "MLA5726",
                                    "name": "Electrodomésticos y Aires Ac."
                                }
                            ])
                        })
                    },
                    getPublicationsWithFilters: function (categoryId) {
                        if (categoryId.id === 'MLA5726') {
                            return new Promise(function (resolve, reject) {
                                resolve([{
                                    "id": "MLA749158328",
                                    "title": "Mercado Pago Kit Point Mpos + Código Qr",
                                    "price": 99,
                                    "permalink": "https://articulo.mercadolibre.com.ar/MLA-749158328-mercado-pago-kit-point-mpos-codigo-qr-_JM"
                                }])
                            })
                        }
                    }
                }
            })

            jest.mock('../src/notifications/notifier', () => ({
                notify: mockNotify
            }))

            let service = require('../src/service/meli-service')

            afterEach(() => {
                mockNotify.mockReset()
            })

            it("Do not notify again or update anything", async function () {

                await service.retrieveCheapFullProducts()

                expect(mockNotify).not.toHaveBeenCalled()
                expect(mockSaveNotifiedPublication).not.toHaveBeenCalled()
            })
        })
    })
})