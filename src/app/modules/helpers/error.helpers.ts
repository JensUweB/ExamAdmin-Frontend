export function getGraphQLError(err): any {
    let result;

    if (err.graphQLErrors !== undefined) {
        if (Array.isArray(err.graphQLErrors)) {
            result = 'Error: ' + err.graphQLErrors[0].message.error + ', Status Code: '
            + err.graphQLErrors[0].message.statusCode + ', Message: ' + err.graphQLErrors[0].message.message;
        } else {
            result = JSON.stringify(err);
        }
    } else {
        result = JSON.stringify(err);
    }

    return result;
}
/**
 *
 * @param module The name of the module where the error occures
 * @param err The error object
 */
export function logError(module: string, err: any) {
    if (err !== undefined) {
        if (err.graphQLErrors !== undefined && err.graphQLErrors.length > 0) {
            if (err.graphQLErrors.length > 0) {
                if (Array.isArray(err.graphQLErrors)) {
                    if (err.graphQLErrors[0].message !== undefined) {
                        if (err.graphQLErrors[0].message.statusCode !== undefined) {
                            if (err.graphQLErrors[0].message.statusCode === 401 || err.graphQLErrors[0].message.statusCode === '401') {
                                return console.warn(module + ' ', err.graphQLErrors[0].message);
                            } else {
                                return console.error(module + ' ', err);
                            }
                        } else {
                            return console.error(module + ' ', err);
                        }
                    } else {
                        return console.error(module + ' ', err);
                    }
                } else {
                    return console.error(module + ' ', err);
                }
            } else {
                if (err.networkError !== undefined) {
                    return console.error('Network Error: ' + err.networkError.statusText
                    + ', Status Code: ' + err.networkError.status + ', Message: ', err.networkError.message);
                }
            }
        } else {
            return console.error(module + ' ', err);
        }
    }
}

export function getStatusCode(err: any): number {
    // err.graphQLErrors[0].message.statusCode
    if (err) {
        if (err.graphQLErrors) {
            if (err.graphQLErrors.length > 0) {
                if (err.graphQLErrors[0].message) {
                    return +err.graphQLErrors[0].message.statusCode;
                }
            }
        }
    }
    return 500;
}
