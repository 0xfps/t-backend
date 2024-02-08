/**
 * Every response returned by Tradable implements
 * this interface.
 */
export default interface ResponseInterface {
    status: number,
    msg: string,
    data?: Object
}