export function getPostRequestWithNewCommand(postRequestData, command) {
    let data = JSON.parse(JSON.stringify(postRequestData));
    data['command'] = command;
    return data;
}