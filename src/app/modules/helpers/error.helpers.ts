export function getGraphQLError(err): string {
    return 'Error: '+err.graphQLErrors[0].message.statusCode+', '+err.graphQLErrors[0].message.error;
}