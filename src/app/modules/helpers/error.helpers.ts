export function getGraphQLError(err): any {
    let result;

    if(err.graphQLErrors !== undefined) {
        if(Array.isArray(err.graphQLErrors)) {
            result = 'Error: '+err.graphQLErrors[0].message.error+', Status Code: '+err.graphQLErrors[0].message.statusCode+', Message: '+err.graphQLErrors[0].message.message;
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
 * @param err 
 */
export function logError(module: string, err: any) {
    if(err !== undefined) {
        if(err.graphQLErrors !== undefined) {
            if(Array.isArray(err.graphQLErrors)) {
                if(err.graphQLErrors[0].message !== undefined) {
                    if(err.graphQLErrors[0].message.statusCode !== undefined) {
                        if(err.graphQLErrors[0].message.statusCode == 401 || err.graphQLErrors[0].message.statusCode == '401') {
                            return console.warn(module+' ',err.graphQLErrors[0].message);
                        }
                        else {
                            return console.error(module+' ',err);
                        }
                    } else {
                        return console.error(module+' ',err);
                    }
                } else {
                    return console.error(module+' ',err);
                }
            } else {
                return console.error(module+' ',err);
            }
        } else {
            return console.error(module+' ',err);
        }
    }
}