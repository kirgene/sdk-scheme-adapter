/**************************************************************************
 *  (C) Copyright ModusBox Inc. 2019 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       James Bush - james.bush@modusbox.com                             *
 **************************************************************************/

'use strict';

const mockError = require('./data/mockError');
const mockRequestToPayError = require('./data/mockRequestToPayError');
const mockRequestToPayTransferError = require('./data/mockRequestToPayTransferError');
const transferRequest = require('./data/transferRequest');
const requestToPayPayload = require('./data/requestToPay');
const requestToPayTransferRequest = require('./data/requestToPayTransferRequest');
const mockLogger = require('../mockLogger');

jest.mock('@internal/model');

const handlers = require('../../../OutboundServer/handlers');
const { OutboundTransfersModel, OutboundRequestToPayTransferModel, OutboundRequestToPayModel, OutboundAuthorizationsModel } = require('@internal/model');

/**
 * Mock the outbound transfer model to simulate throwing errors
 */
OutboundTransfersModel.mockImplementation(() => {
    return {
        run: async () => {
            // throw the mockError object when the model is run
            throw mockError;
        },
        initialize: async () => {
            // nothing needed here
            return;
        },
        load: async () => {
            // nothing needed here
            return;
        }
    };
});

/**
 * Mock the outbound transfer model to simulate throwing errors
 */
OutboundRequestToPayTransferModel.mockImplementation(() => {
    return {
        run: async () => {
            // throw the mockError object when the model is run
            throw mockRequestToPayTransferError;
        },
        initialize: async () => {
            // nothing needed here
            return;
        },
        load: async () => {
            // nothing needed here
            return;
        }
    };
});

/**
 * Mock the outbound request to pay model to simulate throwing errors
 */
OutboundRequestToPayModel.mockImplementation(() => {
    return {
        run: async () => {
            // throw the mockError object when the model is run
            throw mockRequestToPayError;
        },
        initialize: async () => {
            // nothing needed here
            return;
        },
        load: async () => {
            // nothing needed here
            return;
        }
    };
});


describe('Outbound API handlers:', () => {
    describe('POST /transfers', () => {
        test('returns correct error response body when model throws mojaloop error', async () => {
            const mockContext = {
                request: {
                    body: transferRequest,
                    headers: {
                        'fspiop-source': 'foo'
                    }
                },
                response: {},
                state: {
                    conf: {},
                    logger: mockLogger({ app: 'outbound-api-handlers-test'})
                }
            };

            await handlers['/transfers'].post(mockContext);
            
            // check response is correct
            expect(mockContext.response.status).toEqual(500);
            expect(mockContext.response.body).toBeTruthy();
            expect(mockContext.response.body.message).toEqual('Mock error');
            expect(mockContext.response.body.statusCode)
                .toEqual(mockError.transferState.lastError.mojaloopError.errorInformation.errorCode);
            expect(mockContext.response.body.transferState).toEqual(mockError.transferState);
        });

        test('uses correct extension list error code for response body statusCode when configured to do so', async () => {
            const mockContext = {
                request: {
                    body: transferRequest,
                    headers: {
                        'fspiop-source': 'foo'
                    }
                },
                response: {},
                state: {
                    conf: {
                        outboundErrorStatusCodeExtensionKey: 'extErrorKey'  // <- tell the handler to use this extensionList item as source of statusCode
                    },
                    logger: mockLogger({ app: 'outbound-api-handlers-test'})
                }
            };

            await handlers['/transfers'].post(mockContext);

            // check response is correct
            expect(mockContext.response.status).toEqual(500);
            expect(mockContext.response.body).toBeTruthy();
            expect(mockContext.response.body.message).toEqual('Mock error');

            // in this case, where we have set outboundErrorExtensionKey config we expect the error body statusCode
            // property to come from the extensionList item with the corresponding key 'extErrorKey'
            expect(mockContext.response.body.statusCode).toEqual('9999');
            expect(mockContext.response.body.transferState).toEqual(mockError.transferState);
        });
    });

    describe('POST /requestToPayTransfer', () => {
        test('returns correct error response body when model throws mojaloop error', async () => {
            const mockContext = {
                request: {
                    body: requestToPayTransferRequest,
                    headers: {
                        'fspiop-source': 'foo'
                    }
                },
                response: {},
                state: {
                    conf: {},
                    logger: mockLogger({ app: 'outbound-api-handlers-test'})
                }
            };

            await handlers['/requestToPayTransfer'].post(mockContext);
            // check response is correct
            expect(mockContext.response.status).toEqual(500);
            expect(mockContext.response.body).toBeTruthy();
            expect(mockContext.response.body.message).toEqual('Mock error');
            expect(mockContext.response.body.statusCode)
                .toEqual(mockRequestToPayTransferError.requestToPayTransferState.lastError.mojaloopError.errorInformation.errorCode);
            expect(mockContext.response.body.requestToPayTransferState).toEqual(mockRequestToPayTransferError.requestToPayTransferState);
        });
    });


    describe('PUT /transfers', () => {
        test('returns correct error response body when model throws mojaloop error', async () => {
            const mockContext = {
                request: {
                    body: {
                        acceptQuote: true
                    },
                    headers: {
                        'fspiop-source': 'foo'
                    }
                },
                response: {},
                state: {
                    conf: {},
                    logger: mockLogger({ app: 'outbound-api-handlers-test'}),
                    path: {
                        params: {
                            transferId: '12345'
                        }
                    }
                }
            };

            await handlers['/transfers/{transferId}'].put(mockContext);

            // check response is correct
            expect(mockContext.response.status).toEqual(500);
            expect(mockContext.response.body).toBeTruthy();
            expect(mockContext.response.body.message).toEqual('Mock error');
            expect(mockContext.response.body.statusCode).toEqual('3204');
            expect(mockContext.response.body.transferState).toEqual(mockError.transferState);
        });
    });

    describe('POST /requestToPay', () => {
        test('returns correct error response body when model throws mojaloop error', async () => {
            const mockContext = {
                request: {
                    body: requestToPayPayload,
                    headers: {
                        'fspiop-source': 'foo'
                    }
                },
                response: {},
                state: {
                    conf: {},
                    logger: mockLogger({ app: 'outbound-api-handlers-test'})
                }
            };

            await handlers['/requestToPay'].post(mockContext);

            // check response is correct
            expect(mockContext.response.status).toEqual(500);
            expect(mockContext.response.body).toBeTruthy();
            expect(mockContext.response.body.message).toEqual('Mock error');
            expect(mockContext.response.body.statusCode).toEqual('3204');
            expect(mockContext.response.body.requestToPayState).toEqual(mockRequestToPayError.requestToPayState);
        });
    });

    describe('POST /authorizations', () => {
        test('happy flow', async() => {
            
            const mockContext = {
                request: {
                    body: {the: 'body'},
                    headers: {
                        'fspiop-source': 'foo'
                    }
                },
                response: {},
                state: {
                    conf: {},
                    wso2Auth: 'mocked wso2Auth',
                    logger: mockLogger({ app: 'outbound-api-handlers-test'}),
                    cache: { the: 'mocked cache' }
                },
            };
            
            // mock state machine
            const mockedPSM = {
                run: jest.fn(async () => ({ the: 'run response' }))
            };
            
            const createSpy = jest.spyOn(OutboundAuthorizationsModel, 'create')
                .mockImplementationOnce(async () => mockedPSM);

            // invoke handler
            await handlers['/authorizations'].post(mockContext);

            // PSM model creation
            expect(createSpy).toBeCalledTimes(1);
            const request = mockContext.request;
            const state = mockContext.state;
            expect(createSpy).toBeCalledWith(request.body, {
                cache: state.cache,
                logger: state.logger,
                wso2Auth: state.wso2Auth
            });

            // run workflow
            expect(mockedPSM.run).toBeCalledTimes(1);
            expect(mockedPSM.run.mock.calls[0].length).toBe(0);

            // response
            expect(mockContext.response.status).toBe(200);
            expect(mockContext.response.body).toEqual({ the: 'run response' });
        });
    });
});
