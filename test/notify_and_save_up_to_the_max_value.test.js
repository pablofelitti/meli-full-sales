describe("Already existing notified publications exist", function () {
    describe("Four already existing publications and three new publications appear", function () {
        describe("The existing ones are older than 10 days", function () {

            let mockSaveNotifiedPublication = jest.fn(() => {
                return new Promise(function (resolve, reject) {
                    resolve()
                })
            })
            let mockUpdateNotifiedPublication = jest.fn(() => {
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
                                "id": "MLA1",
                                "title": "Product 1",
                                "price": "446",
                                "notified_date": "2021-07-13T03:00:00.000Z"
                            }, {
                                "id": "MLA2",
                                "title": "Product 2",
                                "price": "446",
                                "notified_date": "2021-07-13T03:00:00.000Z"
                            }, {
                                "id": "MLA3",
                                "title": "Product 3",
                                "price": "446",
                                "notified_date": "2021-07-13T03:00:00.000Z"
                            }, {
                                "id": "MLA4",
                                "title": "Product 4",
                                "price": "446",
                                "notified_date": "2021-07-13T03:00:00.000Z"
                            }])
                        })
                    },
                    saveNotifiedPublication: mockSaveNotifiedPublication,
                    updateNotifiedPublications: mockUpdateNotifiedPublication,
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
                                    "id": "MLA1",
                                    "title": "Product 1",
                                    "price": 99,
                                    "permalink": "https://articulo.mercadolibre.com.ar/MLA-1-description"
                                }, {
                                    "id": "MLA2",
                                    "title": "Product 2",
                                    "price": 99,
                                    "permalink": "https://articulo.mercadolibre.com.ar/MLA-2-description"
                                }, {
                                    "id": "MLA3",
                                    "title": "Product 3",
                                    "price": 99,
                                    "permalink": "https://articulo.mercadolibre.com.ar/MLA-3-description"
                                }, {
                                    "id": "MLA4",
                                    "title": "Product 4",
                                    "price": 99,
                                    "permalink": "https://articulo.mercadolibre.com.ar/MLA-4-description"
                                }, {
                                    "id": "MLA5",
                                    "title": "Product 5",
                                    "price": 99,
                                    "permalink": "https://articulo.mercadolibre.com.ar/MLA-5-description"
                                }, {
                                    "id": "MLA6",
                                    "title": "Product 6",
                                    "price": 99,
                                    "permalink": "https://articulo.mercadolibre.com.ar/MLA-6-description"
                                }, {
                                    "id": "MLA7",
                                    "title": "Product 7",
                                    "price": 99,
                                    "permalink": "https://articulo.mercadolibre.com.ar/MLA-7-description"
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

            it("Notify only 6 in the current execution", async function () {

                await service.retrieveCheapFullProducts()

                expect(mockNotify).toHaveBeenCalled()
                expect(mockUpdateNotifiedPublication).toHaveBeenCalledWith(expect.arrayContaining([
                    {id: "MLA1", notified_date: new Date(Date.parse("07/30/2021"))},
                    {id: "MLA2", notified_date: new Date(Date.parse("07/30/2021"))},
                    {id: "MLA3", notified_date: new Date(Date.parse("07/30/2021"))}
                ]))
                expect(mockSaveNotifiedPublication).toHaveBeenCalledWith(expect.arrayContaining([
                    ["MLA5", "Product 5", 99, new Date(Date.parse("07/30/2021"))],
                    ["MLA6", "Product 6", 99, new Date(Date.parse("07/30/2021"))],
                    ["MLA7", "Product 7", 99, new Date(Date.parse("07/30/2021"))]
                ]))
            }) FALTA PROBAR LOS CASOS EN QUE SOLO PRODUCTOS NUEVOS SUPERAN EL MAX Y SOLO PRODUCTOS PARA UPDATE SUPERAN EL MAXIMO
        })
    })
})